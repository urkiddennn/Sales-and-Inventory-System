const API_URL = process.env.REACT_APP_API_URL;

export const getCart = async (token) => {
    const response = await fetch(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
};

export const addToCart = async (token, cartData) => {
    const response = await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cartData),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
};

export const removeFromCart = async (token, productId) => {
    const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
    });
    if (!response.ok) throw new Error('Failed to remove from cart');
    return response.json();
};
