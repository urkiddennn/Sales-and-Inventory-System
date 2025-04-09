const API_URL = process.env.REACT_APP_API_URL;

export const getChats = async (token) => {
    const response = await fetch(`${API_URL}/chats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch chats');
    return response.json();
};

export const sendMessage = async (token, messageData) => {
    const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
};
