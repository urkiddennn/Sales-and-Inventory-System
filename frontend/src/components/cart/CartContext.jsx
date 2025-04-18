import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCart, addToCart, removeFromCart, updateCart, clearCart as clearCartApi } from '../../api';
import { message } from 'antd';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const [cart, setCart] = useState({ items: [] });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart(token);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const addItemToCart = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                throw new Error('Please log in to add items to cart.');
            }
            const updatedCart = await addToCart(token, { productId, quantity });
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error adding to cart:', error);
            if (error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            throw error;
        }
    };

    const removeItemFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                throw new Error('Please log in to remove items from cart.');
            }
            const updatedCart = await removeFromCart(token, productId);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error removing from cart:', error);
            if (error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            throw error;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                throw new Error('Please log in to update cart.');
            }
            const updatedCart = await updateCart(token, productId, quantity);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error updating cart:', error);
            if (error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                throw new Error('Please log in to clear cart.');
            }
            if (!cart.items || cart.items.length === 0) {
                setCart({ items: [] });
                return;
            }

            // Try bulk clear first
            try {
                await clearCartApi(token);
                setCart({ items: [] });
                return;
            } catch (bulkError) {
                console.warn('Bulk clear failed, falling back to individual removes:', bulkError.message);
                if (bulkError.message.includes('Unauthorized')) {
                    localStorage.removeItem('token');
                    navigate('/login');
                    throw bulkError;
                }
            }

            // Fallback to individual removes
            for (const item of cart.items) {
                if (!item.product?._id) {
                    console.warn('Invalid product ID in cart item:', item);
                    continue;
                }
                try {
                    await removeFromCart(item.product._id);
                } catch (itemError) {
                    console.error(`Failed to remove item ${item.product._id}:`, itemError.message);
                    if (itemError.message.includes('Unauthorized')) {
                        localStorage.removeItem('token');
                        navigate('/login');
                        throw itemError;
                    }
                }
            }
            setCart({ items: [] });
        } catch (error) {
            console.error('Error clearing cart:', error);
            throw error;
        }
    };

    const fetchCart = async (token) => {
        try {
            const cartData = await getCart(token);
            setCart({ ...cartData, items: cartData.items || [] });
        } catch (error) {
            console.error('Error fetching cart:', error);
            if (error.message.includes('Unauthorized')) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setCart({ items: [] });
        }
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart: addItemToCart,
                removeFromCart: removeItemFromCart,
                updateCart: updateCartItem,
                clearCart,
                fetchCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
