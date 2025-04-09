const API_URL = process.env.REACT_APP_API_URL;

export const addComment = async (token, commentData) => {
    const response = await fetch(`${API_URL}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
};

export const getProductComments = async (token, productId) => {
    const response = await fetch(`${API_URL}/comments/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch comments');
    return response.json();
};
