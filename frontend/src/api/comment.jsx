const API_URL = "/api";
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
        const response = await fetch(`${API_URL}/comments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },

        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch comments');
        }
        return await response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
