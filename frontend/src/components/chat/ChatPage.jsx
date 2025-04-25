"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "../auth/AuthContext"
import axios from "axios"
import { message, Spin } from "antd"
import { SendOutlined } from "@ant-design/icons"
import { format } from "date-fns"

const API_URL = import.meta.env.VITE_API_URL

const ChatPage = () => {
    const { user } = useAuth()
    const [adminChat, setAdminChat] = useState({ messages: [] })
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [adminId, setAdminId] = useState(null)

    // Fetch admin ID
    const fetchAdminId = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/users/admin`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            setAdminId(response.data._id)
        } catch (error) {
            console.error("Fetch admin ID error:", error)
            message.error("Failed to fetch admin details")
        }
    }, [])

    // Fetch user-admin chat
    const fetchChat = useCallback(async () => {
        if (!user || !adminId) return
        try {
            const response = await axios.get(`${API_URL}/chats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            })
            const chats = response.data
            const adminChat = chats.find((chat) => chat.participants.some((p) => p._id === adminId)) || { messages: [] }
            setAdminChat(adminChat)
        } catch (error) {
            message.error("Failed to fetch chat")
            console.error("Fetch chat error:", error)
        }
    }, [user, adminId])

    // Send a message
    const sendMessage = async (content) => {
        if (!content.trim() || !user || !adminId) return
        setIsSending(true)
        try {
            const response = await axios.post(
                `${API_URL}/chats`,
                { recipientId: adminId, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
            )
            setAdminChat(response.data)
            setNewMessage("")
        } catch (error) {
            message.error("Failed to send message")
            console.error("Send message error:", error)
        } finally {
            setIsSending(false)
        }
    }

    // Poll for new messages and fetch admin ID
    useEffect(() => {
        fetchAdminId()
        const interval = setInterval(fetchChat, 5000)
        return () => clearInterval(interval)
    }, [fetchAdminId, fetchChat])

    return (
        <div className="w-full h-1/2 bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="py-3 px-4 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-2xl mx-auto w-full">
                    <h1 className="text-lg font-medium text-gray-800">Support Chat {user?.name ? `· ${user.name}` : ""}</h1>
                </div>
            </header>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-[calc(100vh-180px)]">
                    {adminChat.messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">Welcome to support chat! Send a message to get started.</p>
                            </div>
                        </div>
                    ) : (
                        adminChat.messages.map((msg) => (
                            <div key={msg._id} className={`flex ${msg.sender._id === user?.id ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`p-3 rounded-lg max-w-[80%] ${msg.sender._id === user?.id ? "bg-blue-500 text-white" : "bg-white shadow-sm"
                                        }`}
                                >
                                    <p>{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.sender._id === user?.id ? "text-blue-100" : "text-gray-400"}`}>
                                        {format(new Date(msg.timestamp), "p · MMM d")}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="flex p-2">
                        <input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 px-3 py-2 text-gray-800 bg-transparent border-none focus:outline-none"
                            disabled={isSending || !user || !adminId}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage(newMessage)}
                        />
                        <button
                            onClick={() => sendMessage(newMessage)}
                            disabled={isSending || !newMessage.trim() || !adminId}
                            className={`px-4 py-2 rounded-full flex items-center justify-center ${!newMessage.trim() || !adminId
                                ? "text-gray-400 bg-gray-100"
                                : "text-white bg-blue-500 hover:bg-blue-600"
                                } transition-colors`}
                            aria-label="Send message"
                        >
                            {isSending ? <Spin size="small" /> : <SendOutlined />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatPage
