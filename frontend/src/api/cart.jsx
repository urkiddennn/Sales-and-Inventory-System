const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Add product to cart (protected endpoint)
export const addToCart = async (token, cartData) => {
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
};

// Remove product from cart (protected endpoint)
export const removeFromCart = async (token, productId) => {
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
};

// Fetch cart (protected endpoint)
export const getCart = async (token) => {
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
};

// Update cart item quantity (protected endpoint)
export const updateCart = async (token, productId, quantity) => {
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
};
