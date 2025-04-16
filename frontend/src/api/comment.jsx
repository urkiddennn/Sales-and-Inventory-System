const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const addComment = async (token, commentData) => {
    try {
        console.log('Adding comment with data:', commentData);
        const response = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                productId: commentData.productId,
                content: commentData.comment, // Map comment to content
                rating: commentData.rating,
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add comment');
        }
        return response.json();
    } catch (error) {
        console.error('Error in addComment:', error);
        throw error;
    }
};

export const getProductComments = async (token, productId) => {
    try {
        console.log('Fetching comments for productId:', productId);
        const response = await fetch(`${API_URL}/comments/${productId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch comments');
        }
        return response.json();
    } catch (error) {
        console.error('Error in getProductComments:', error);
        throw error;
    }
};
