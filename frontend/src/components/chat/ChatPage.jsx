
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import axios from "axios";
import { Input, Button, message } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { format } from "date-fns";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ChatPage = () => {
    const { user } = useAuth();
    const [adminChat, setAdminChat] = useState({ messages: [] });
    const [newMessage, setNewMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
            // Find user-admin chat
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
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/chats`,
                { recipientId: adminId, content },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setAdminChat(response.data);
            setNewMessage("");
            fetchChat(); // Refresh chat
        } catch (error) {
            message.error("Failed to send message");
            console.error("Send message error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Poll for new messages
    useEffect(() => {
        fetchAdminId();
        fetchChat();
        const interval = setInterval(fetchChat, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [fetchAdminId, fetchChat]);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4">
                <h1 className="text-2xl font-bold text-white">Chat with Admin</h1>
                <p className="text-sm text-white">Welcome, {user?.name || "User"}!</p>
            </header>

            {/* Chat Content */}
            <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4">
                    {adminChat.messages.length === 0 ? (
                        <p className="text-white">No messages with admin yet.</p>
                    ) : (
                        adminChat.messages.map((msg) => (
                            <div
                                key={msg._id}
                                className={`mb-4 p-3 rounded-lg ${msg.sender._id === user?.id
                                    ? "bg-green-700 text-white ml-auto"
                                    : "bg-white text-green-700 mr-auto"
                                    } max-w-[70%]`}
                            >
                                <p className="font-semibold">
                                    {msg.sender._id === user?.id ? "You" : "Admin"}
                                </p>
                                <p>{msg.content}</p>
                                <p className="text-xs text-white mt-1">
                                    {format(new Date(msg.timestamp), "PPp")}
                                </p>
                            </div>
                        ))
                    )}
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message to admin..."
                        className="flex-1 text-white border-green-700 rounded-lg"
                        style={{ background: "transparent", color: "white" }}
                        disabled={isLoading || !user || !adminId}
                    />
                    <Button
                        type="primary"
                        icon={<SendOutlined />}
                        onClick={() => sendMessage(newMessage)}
                        loading={isLoading}
                        className="bg-green-700 hover:bg-green-800 text-white border-none"
                        disabled={!adminId}
                    >
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
