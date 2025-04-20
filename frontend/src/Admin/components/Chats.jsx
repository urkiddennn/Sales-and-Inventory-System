"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Input, Button, Avatar, Empty, message, Spin } from "antd"
import { SendOutlined, UserOutlined, SearchOutlined } from "@ant-design/icons"
import { getChats, sendMessage } from "../../api"

const Chats = () => {
    const navigate = useNavigate()
    const [chats, setChats] = useState([])
    const [selectedChat, setSelectedChat] = useState(null)
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [loading, setLoading] = useState(false)

    // Debug function to check localStorage
    useEffect(() => {
        console.log("All localStorage keys:")
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            console.log(`${key}: ${localStorage.getItem(key)}`)
        }
    }, [])

    const token = localStorage.getItem("token")

    useEffect(() => {
        if (!token) {
            message.error("Please log in to view chats")
            navigate("/login")
            return
        }

        const fetchChats = async () => {
            setLoading(true)
            try {
                const fetchedChats = await getChats(token)
                setChats(fetchedChats)
                if (fetchedChats.length > 0 && !selectedChat) {
                    setSelectedChat(fetchedChats[0])
                }
            } catch (error) {
                message.error(error.message || "Failed to fetch chats")
                console.error("Fetch chats error:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchChats()
    }, [token, navigate])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const getLastMessage = (chat) => {
        if (!chat.messages || chat.messages.length === 0) return null
        return chat.messages[chat.messages.length - 1]
    }

    const getOtherParticipant = (chat) => {
        return chat.participants.find((p) => p._id !== localStorage.getItem("userId"))
    }

    const filteredChats = chats.filter((chat) => {
        const otherParticipant = getOtherParticipant(chat)
        if (!otherParticipant) return false
        return (
            otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedChat) return

        const otherParticipant = getOtherParticipant(selectedChat)
        if (!otherParticipant) {
            message.error("Invalid chat participant")
            return
        }

        try {
            const response = await sendMessage(token, {
                recipientId: otherParticipant._id,
                content: messageInput,
            })

            setChats((prevChats) => prevChats.map((chat) => (chat._id === response._id ? response : chat)))
            setSelectedChat(response)
            setMessageInput("")
        } catch (error) {
            message.error(error.message || "Failed to send message")
            console.error("Send message error:", error)
        }
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h2 className="text-xl font-medium mb-4">Conversations</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Chat List */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-3 border-b">
                        <div className="relative">
                            <Input
                                placeholder="Search conversations"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                prefix={<SearchOutlined className="text-gray-400" />}
                                className="rounded-full bg-gray-50"
                                allowClear
                            />
                        </div>
                    </div>

                    <div className="h-[calc(70vh-80px)] overflow-auto">
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <Spin />
                            </div>
                        ) : filteredChats.length > 0 ? (
                            <div className="divide-y">
                                {filteredChats.map((chat) => {
                                    const otherParticipant = getOtherParticipant(chat)
                                    const lastMessage = getLastMessage(chat)
                                    const isSelected = selectedChat?._id === chat._id

                                    return (
                                        <div
                                            key={chat._id}
                                            onClick={() => setSelectedChat(chat)}
                                            className={`p-3 cursor-pointer transition-colors ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Avatar icon={<UserOutlined />} className={isSelected ? "bg-blue-500" : ""} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-medium text-gray-900 truncate">{otherParticipant.name}</p>
                                                        {lastMessage && (
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(lastMessage.timestamp).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lastMessage && <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>}
                                                </div>
                                                {lastMessage && lastMessage.sender._id !== localStorage.getItem("userId") && (
                                                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <Empty description="No conversations found" className="my-10" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        )}
                    </div>
                </div>

                {/* Chat Messages */}
                <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[70vh]">
                    {selectedChat ? (
                        <>
                            <div className="p-3 border-b">
                                <div className="flex items-center">
                                    <Avatar icon={<UserOutlined />} />
                                    <div className="ml-3">
                                        <p className="font-medium">{getOtherParticipant(selectedChat).name}</p>
                                        <p className="text-xs text-gray-500">{getOtherParticipant(selectedChat).email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-auto p-4 bg-gray-50">
                                {selectedChat.messages.map((message) => {
                                    // Get the current user ID from localStorage
                                    const currentUserId = localStorage.getItem("userId")

                                    // Log the IDs for debugging
                                    console.log("Message sender:", message.sender)
                                    console.log("Current user ID:", currentUserId)

                                    // Check multiple possible ID properties and formats
                                    const isCurrentUser =
                                        (message.sender._id && message.sender._id === currentUserId) ||
                                        (message.sender.id && message.sender.id === currentUserId) ||
                                        // If the sender is just the ID itself
                                        (typeof message.sender === "string" && message.sender === currentUserId)

                                    console.log("Is current user message:", isCurrentUser)

                                    return (
                                        <div key={message._id} className={`mb-4 flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${isCurrentUser ? "bg-blue-500 text-white" : "bg-white shadow-sm"
                                                    }`}
                                            >
                                                <p>{message.content}</p>
                                                <p className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-400"}`}>
                                                    {formatDate(message.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="p-3 border-t bg-white">
                                <div className="flex space-x-2">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onPressEnter={handleSendMessage}
                                        placeholder="Type a message..."
                                        className="rounded-full bg-gray-50"
                                        disabled={loading}
                                    />
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleSendMessage}
                                        disabled={loading || !messageInput.trim()}
                                        className="rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "#3b82f6" }}
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50">
                            <div className="text-center">
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Chats
