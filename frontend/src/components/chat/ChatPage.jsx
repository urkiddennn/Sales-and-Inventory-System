

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import { message, Spin } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ChatPage = () => {
    const { user } = useAuth();
    const [adminChat, setAdminChat] = useState({ messages: [] });
    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [adminId, setAdminId] = useState(null);

    // Fetch admin ID
    const fetchAdminId = useCallback(async () => {
        try {
            const response = await axios.get(`${API_URL}/users/admin`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setAdminId(response.data._id);
        } catch (error) {
            console.error("Fetch admin ID error:", error);
            message.error("Failed to fetch admin details");
        }
    }, []);

    // Fetch user-admin chat
    const fetchChat = useCallback(async () => {
        if (!user || !adminId) return;
        try {
            const response = await axios.get(`${API_URL}/chats`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const chats = response.data;
            const adminChat = chats.find((chat) =>
                chat.participants.some((p) => p._id === adminId)
            ) || { messages: [] };
            setAdminChat(adminChat);
        } catch (error) {
            message.error("Failed to fetch chat");
            console.error("Fetch chat error:", error);
        }
    }, [user, adminId]);

    // Send a message
    const sendMessage = async (content) => {
        if (!content.trim() || !user || !adminId) return;
        setIsSending(true);
        try {
            const response = await axios.post(
                `${API_URL}/chats`,
                { recipientId: adminId, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setAdminChat(response.data);
            setNewMessage("");
        } catch (error) {
            message.error("Failed to send message");
            console.error("Send message error:", error);
        } finally {
            setIsSending(false);
        }
    };

    // Poll for new messages and fetch admin ID
    useEffect(() => {
        fetchAdminId();
        const interval = setInterval(fetchChat, 5000);
        return () => clearInterval(interval);
    }, [fetchAdminId, fetchChat]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="p-4 bg-white border-b border-gray-200">
                <h1 className="text-xl font-semibold text-gray-800">
                    Support Chat {user?.name ? `(${user.name})` : ""}
                </h1>
            </header>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col p-4 max-w-2xl mx-auto w-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                    {adminChat.messages.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center">Start a conversation with support</p>
                    ) : (
                        adminChat.messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`p-3 rounded-lg max-w-[80%] text-sm ${msg.sender._id === user?.id
                                        ? "bg-teal-500 text-white ml-auto"
                                        : "bg-white border border-gray-200 text-gray-800 mr-auto"
                                    }`}
                            >
                                <p className="font-medium">{msg.sender._id === user?.id ? "You" : "Support"}</p>
                                <p className="mt-1">{msg.content}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {format(new Date(msg.timestamp), "PPp")}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2 bg-white p-2 rounded-md border border-gray-200">
                    <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-3 py-2 text-sm text-gray-800 bg-transparent border-none focus:outline-none"
                        disabled={isSending || !user || !adminId}
                        onKeyPress={(e) => e.key === "Enter" && sendMessage(newMessage)}
                    />
                    <button
                        onClick={() => sendMessage(newMessage)}
                        disabled={isSending || !newMessage.trim() || !adminId}
                        className="px-3 py-2 text-teal-500 hover:text-teal-600 disabled:text-gray-400 transition-colors"
                        aria-label="Send message"
                    >
                        {isSending ? <Spin size="small" /> : <SendOutlined />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
