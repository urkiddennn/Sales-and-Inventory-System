import { message } from 'antd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Add product to cart (protected endpoint)
export const addToCart = async (token, cartData) => {
    try {
        console.log('Adding to cart:', cartData);
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cartData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add to cart');
        }

        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

// Remove product from cart (protected endpoint)
export const removeFromCart = async (token, productId) => {
    try {
        console.log('Removing from cart:', productId);
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to remove from cart');
        }

        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

// Fetch cart (protected endpoint)
export const getCart = async (token) => {
    try {
        console.log('Fetching cart from:', `${API_URL}/cart`);
        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch cart');
        }

        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

// Update cart item quantity (protected endpoint)
export const updateCart = async (token, productId, quantity) => {
    try {
        console.log('Updating cart:', { productId, quantity });
        const response = await fetch(`${API_URL}/cart`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ productId, quantity }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update cart');
        }

        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
