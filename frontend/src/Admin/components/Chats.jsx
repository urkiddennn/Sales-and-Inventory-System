"use client"

import { useState } from "react"
import { Row, Col, List, Input, Button, Avatar, Card, Typography, Empty } from "antd"
import { SendOutlined, UserOutlined } from "@ant-design/icons"

const { Search } = Input
const { Text } = Typography

const Chats = () => {
    const [selectedChat, setSelectedChat] = useState(null)
    const [messageInput, setMessageInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")

    // Sample chat data based on the model
    const [chats, setChats] = useState([
        {
            id: "1",
            participants: [
                { id: "1", name: "John Doe", email: "john@example.com" },
                { id: "admin", name: "Admin User", email: "admin@example.com" },
            ],
            messages: [
                { id: "1", sender: "1", content: "Hello, I need help with my order #12345", timestamp: "2023-09-15T10:25:00Z" },
                {
                    id: "2",
                    sender: "admin",
                    content: "Hi John, I'd be happy to help. What seems to be the issue?",
                    timestamp: "2023-09-15T10:28:00Z",
                },
                {
                    id: "3",
                    sender: "1",
                    content: "I ordered the wrong size. Can I exchange it?",
                    timestamp: "2023-09-15T10:30:00Z",
                },
            ],
        },
        {
            id: "2",
            participants: [
                { id: "2", name: "Jane Smith", email: "jane@example.com" },
                { id: "admin", name: "Admin User", email: "admin@example.com" },
            ],
            messages: [
                { id: "1", sender: "2", content: "Hi, is the blue shirt in stock?", timestamp: "2023-09-14T15:10:00Z" },
                { id: "2", sender: "admin", content: "Yes, we have all sizes available", timestamp: "2023-09-14T15:15:00Z" },
                { id: "3", sender: "2", content: "Thanks for your help!", timestamp: "2023-09-14T15:20:00Z" },
            ],
        },
        {
            id: "3",
            participants: [
                { id: "3", name: "Bob Johnson", email: "bob@example.com" },
                { id: "admin", name: "Admin User", email: "admin@example.com" },
            ],
            messages: [
                { id: "1", sender: "3", content: "I placed an order yesterday", timestamp: "2023-09-14T09:05:00Z" },
                { id: "2", sender: "3", content: "When will my order ship?", timestamp: "2023-09-14T09:10:00Z" },
            ],
        },
    ])

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Get the last message from a chat
    const getLastMessage = (chat) => {
        if (chat.messages.length === 0) return null
        return chat.messages[chat.messages.length - 1]
    }

    // Get the other participant (not admin)
    const getOtherParticipant = (chat) => {
        return chat.participants.find((p) => p.id !== "admin")
    }

    // Filter chats based on search query
    const filteredChats = chats.filter((chat) => {
        const otherParticipant = getOtherParticipant(chat)
        return (
            otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            otherParticipant.email.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    const handleSendMessage = () => {
        if (!messageInput.trim() || !selectedChat) return

        const newMessage = {
            id: Date.now().toString(),
            sender: "admin",
            content: messageInput,
            timestamp: new Date().toISOString(),
        }

        const updatedChats = chats.map((chat) => {
            if (chat.id === selectedChat.id) {
                return {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                }
            }
            return chat
        })

        setChats(updatedChats)
        setSelectedChat({
            ...selectedChat,
            messages: [...selectedChat.messages, newMessage],
        })
        setMessageInput("")
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Chats</h2>

            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <Card className="h-[70vh] flex flex-col">
                        <Search
                            placeholder="Search conversations"
                            className="mb-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="overflow-auto flex-1">
                            {filteredChats.length > 0 ? (
                                <List
                                    dataSource={filteredChats}
                                    renderItem={(chat) => {
                                        const otherParticipant = getOtherParticipant(chat)
                                        const lastMessage = getLastMessage(chat)

                                        return (
                                            <List.Item
                                                onClick={() => setSelectedChat(chat)}
                                                className={`cursor-pointer hover:bg-gray-50 ${selectedChat?.id === chat.id ? "bg-gray-100" : ""}`}
                                            >
                                                <List.Item.Meta
                                                    avatar={<Avatar icon={<UserOutlined />} />}
                                                    title={
                                                        <div className="flex justify-between">
                                                            <span>{otherParticipant.name}</span>
                                                            {lastMessage && (
                                                                <Text type="secondary" className="text-xs">
                                                                    {new Date(lastMessage.timestamp).toLocaleDateString()}
                                                                </Text>
                                                            )}
                                                        </div>
                                                    }
                                                    description={
                                                        <div className="flex justify-between items-center">
                                                            {lastMessage && (
                                                                <Text ellipsis className="max-w-[150px]">
                                                                    {lastMessage.content}
                                                                </Text>
                                                            )}
                                                            {lastMessage && lastMessage.sender !== "admin" && (
                                                                <div className="w-2 h-2 rounded-full bg-green-700"></div>
                                                            )}
                                                        </div>
                                                    }
                                                />
                                            </List.Item>
                                        )
                                    }}
                                />
                            ) : (
                                <Empty description="No conversations found" />
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Card className="h-[70vh] flex flex-col">
                        {selectedChat ? (
                            <>
                                <div className="border-b pb-2 mb-4">
                                    <div className="flex items-center">
                                        <Avatar icon={<UserOutlined />} />
                                        <div className="ml-2">
                                            <div className="font-medium">{getOtherParticipant(selectedChat).name}</div>
                                            <div className="text-xs text-gray-500">{getOtherParticipant(selectedChat).email}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-auto mb-4">
                                    {selectedChat.messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`mb-4 flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[70%] rounded-lg p-3 ${message.sender === "admin" ? "bg-green-700 text-white" : "bg-gray-100"
                                                    }`}
                                            >
                                                <div>{message.content}</div>
                                                <div
                                                    className={`text-xs mt-1 ${message.sender === "admin" ? "text-green-100" : "text-gray-500"}`}
                                                >
                                                    {formatDate(message.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto">
                                    <Input.Group compact>
                                        <Input
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onPressEnter={handleSendMessage}
                                            placeholder="Type a message..."
                                            style={{ width: "calc(100% - 40px)" }}
                                        />
                                        <Button
                                            type="primary"
                                            icon={<SendOutlined />}
                                            onClick={handleSendMessage}
                                            style={{ width: "40px", backgroundColor: "#eab308" }}
                                        />
                                    </Input.Group>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex items-center justify-center text-gray-400">
                                Select a conversation to start chatting
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Chats
