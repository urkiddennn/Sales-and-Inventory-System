
import { message } from 'antd';

const API_URL = import.meta.env.REACT_APP_API_URL;

// Cart APIs
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

export const getCart = async (token) => {
    try {
        console.log('Fetching cart from:', `${API_URL}/cart`, { token });
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

export const clearCart = async (token) => {
    try {
        console.log('Clearing cart', { token });
        const response = await fetch(`${API_URL}/cart`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Clear cart error response:', errorData);
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
            throw new Error(errorData.message || 'Failed to clear cart');
        }
        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

// Order APIs
export const createOrder = async (token, orderData) => {
    try {
        console.log('Creating order:', orderData, { token });
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        const text = await response.text();
        console.log('Raw response:', text);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                console.error('Failed to parse error response:', text);
                throw new Error('Server returned invalid JSON');
            }
            console.error('Error response:', errorData);
            throw new Error(errorData.message || 'Failed to create order');
        }

        return JSON.parse(text);
    } catch (error) {
        console.error('Create order error:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

export const getOrders = async (token) => {
    try {
        console.log('Fetching orders from:', `${API_URL}/orders`, { token });
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Get orders error response:', { status: response.status, errorData });
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
            throw new Error(errorData.message || 'Failed to fetch orders');
        }
        return response.json();
    } catch (error) {
        console.error('Get orders error:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};

export const cancelOrder = async (token, orderId) => {
    try {
        console.log('Cancelling order:', { orderId, url: `${API_URL}/orders/${orderId}/cancel`, token });
        const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cancel order error response:', { status: response.status, errorData });
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
            throw new Error(errorData.message || 'Failed to cancel order');
        }
        const data = await response.json();
        console.log('Cancel order success response:', data);
        return data;
    } catch (error) {
        console.error('Cancel order error:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
export const fetchOrderById = async (token, orderId) => {
    try {
        console.log('Fetching order from:', `${API_URL}/orders/${orderId}`, { token });
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch order');
        }
        return response.json();
    } catch (error) {
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
export const updateOrderStatus = async (token, orderId, statusData) => {
    try {
        console.log('Updating order status:', { orderId, statusData, url: `${API_URL}/orders/${orderId}/status`, token });
        const response = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(statusData),
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Update order status error response:', { status: response.status, errorData });
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
            throw new Error(errorData.message || 'Failed to update order status');
        }
        return response.json();
    } catch (error) {
        console.error('Update order status error:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
export const deleteOrder = async (token, orderId) => {
    try {
        console.log('Deleting order:', { orderId, url: `${API_URL}/orders/${orderId}`, token });
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Delete order error response:', { status: response.status, errorData });
            if (response.status === 401) {
                throw new Error('Unauthorized: Please log in again');
            }
            throw new Error(errorData.error || 'Failed to delete order');
        }
        return response.json();
    } catch (error) {
        console.error('Delete order error:', error);
        message.error(error.message || 'An unexpected error occurred');
        throw error;
    }
};
