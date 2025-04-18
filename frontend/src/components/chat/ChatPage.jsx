import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import { getChats, sendMessage } from "../../api";

const ChatPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChatsAndEnsureAdminChat = async () => {
            if (!user) {
                console.log("No user found, aborting chat fetch");
                setError("Please log in to view chats");
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("No authentication token found");

                console.log("Fetching chats with token:", token);
                console.log("API URL:", import.meta.env.VITE_API_URL);

                // Fetch existing chats
                const chatData = await getChats(token);
                console.log("Fetched chats:", chatData);
                let updatedChats = chatData;

                // Fetch admin user
                const adminResponse = await fetch(`${import.meta.env.VITE_API_URL}/users/admin`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!adminResponse.ok) {
                    const errorText = await adminResponse.text();
                    console.error("Admin fetch failed:", adminResponse.status, errorText);
                    if (adminResponse.status === 404) {
                        setError("No admin user available. Please contact support.");
                        return;
                    }
                    throw new Error("Failed to fetch admin");
                }
                const admin = await adminResponse.json();
                console.log("Fetched admin:", admin);

                // Check if chat with admin exists
                const adminChat = updatedChats.find(chat =>
                    chat.participants.some(p => p._id === admin._id)
                );
                console.log("Admin chat exists:", !!adminChat);

                // If no admin chat exists, create one
                if (!adminChat) {
                    const messageData = {
                        recipientId: admin._id,
                        content: "Welcome! You can message the admin here.",
                    };
                    console.log("Creating admin chat with:", messageData);
                    const newChat = await sendMessage(token, messageData);
                    console.log("Created admin chat:", newChat);
                    updatedChats = [...updatedChats, newChat];
                }

                setChats(updatedChats);

                // Automatically select the admin chat
                const selectedAdminChat = updatedChats.find(chat =>
                    chat.participants.some(p => p._id === admin._id)
                );
                if (selectedAdminChat) {
                    console.log("Selecting admin chat:", selectedAdminChat);
                    setSelectedChat(selectedAdminChat);
                }
            } catch (err) {
                setError(err.message || "Failed to load chats");
                console.error("Error in fetchChatsAndEnsureAdminChat:", err);
            } finally {
                setLoading(false);
            }
        };
        if (!authLoading) {
            fetchChatsAndEnsureAdminChat();
        }
    }, [user, authLoading]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) {
            console.log("Cannot send message: Empty message or no chat selected");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const messageData = {
                recipientId: selectedChat.participants.find(p => p._id !== user.id)._id,
                content: message.trim(),
            };
            console.log("Sending message:", messageData);
            const updatedChat = await sendMessage(token, messageData);
            console.log("Message sent, updated chat:", updatedChat);
            setChats(chats.map(c => c._id === updatedChat._id ? updatedChat : c));
            setMessage("");
        } catch (err) {
            setError("Failed to send message");
            console.error("Error sending message:", err);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            {error && <div className="text-red-500 mb-4">{error}</div>}
            {authLoading || loading ? (
                <div>Loading chats...</div>
            ) : (
                <div className="flex gap-4">
                    <div className="w-1/3 border-r pr-4">
                        <h2 className="text-lg font-semibold mb-2">Chats</h2>
                        {chats.length === 0 && !error ? (
                            <div>No chats available</div>
                        ) : (
                            chats.map(chat => (
                                <div
                                    key={chat._id}
                                    className={`p-2 cursor-pointer rounded ${selectedChat?._id === chat._id ? 'bg-gray-100' : ''}`}
                                    onClick={() => {
                                        console.log("Selecting chat:", chat);
                                        setSelectedChat(chat);
                                    }}
                                >
                                    {chat.participants.find(p => p._id !== user.id)?.username || 'Unknown User'}
                                </div>
                            ))
                        )}
                    </div>
                    <div className="w-2/3">
                        {selectedChat ? (
                            <div>
                                <h2 className="text-lg font-semibold mb-2">
                                    Chat with {selectedChat.participants.find(p => p._id !== user.id)?.username || 'Unknown User'}
                                </h2>
                                <div className="border rounded p-4 h-96 overflow-y-auto mb-4">
                                    {selectedChat.messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-2 ${msg.sender._id === user.id ? 'text-right' : 'text-left'}`}
                                        >
                                            <div className={`inline-block p-2 rounded ${msg.sender._id === user.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                <p>{msg.content}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <form onSubmit={handleSendMessage} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => {
                                            console.log("Typing message:", e.target.value);
                                            setMessage(e.target.value);
                                        }}
                                        className="flex-grow border rounded p-2"
                                        placeholder="Type a message..."
                                        disabled={!selectedChat}
                                    />
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
                                        disabled={!message.trim() || !selectedChat}
                                    >
                                        Send
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div>{error ? error : "No chat selected. Please select a chat to start messaging."}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
