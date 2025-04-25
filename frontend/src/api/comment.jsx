const API_URL = "https://cg3solarsroductstading.vercel.app/api"
import { message } from "antd";
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
export const getAllComments = async () => {
    try {
        console.log('Fetching all comments from:', `${API_URL}/comments`);
        const response = await fetch(`${API_URL}/comments`);
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        if (!response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch comments');
            } else {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned an unexpected response');
            }
        }
        return await response.json();
    } catch (error) {
        console.error('Error in getAllComments:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
