const API_URL = "https://cg3solarsroductstading.vercel.app/api"
import { message } from "antd";

module.exports = async (req, res) => {
    // Handle CORS for OPTIONS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        return res.status(200).end();
    }

    // Add CORS headers to all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'GET') {
        try {
            // Your logic to fetch comments
            const comments = await fetchCommentsFromDatabase(); // Replace with your logic
            res.status(200).json(comments);
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
};
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
