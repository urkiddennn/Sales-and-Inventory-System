import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getCart, addToCart, removeFromCart, updateCart, clearCart as clearCartApi } from '../../api';
import { message } from 'antd';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState({ items: [] });

    useEffect(() => {
        console.log("CartProvider: useEffect running, isAuthenticated:", isAuthenticated);
        if (isAuthenticated) {
            const token = localStorage.getItem('token');
            if (token) {
                console.log("CartProvider: Fetching cart for authenticated user");
                fetchCart(token);
            } else {
                console.log("CartProvider: No token found, resetting cart");
                setCart({ items: [] });
            }
        } else {
            console.log("CartProvider: Not authenticated, resetting cart");
            setCart({ items: [] });
        }
    }, [isAuthenticated]);

    const addItemToCart = async (productId, quantity) => {
        try {
            console.log("CartProvider: Adding to cart:", { productId, quantity });
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("CartProvider: No token, redirecting to /login");
                message.error('Please log in to add items to cart.');
                navigate('/login');
                throw new Error('Please log in to add items to cart.');
            }
            const updatedCart = await addToCart(token, { productId, quantity });
            setCart({ ...updatedCart, items: updatedCart.items || [] });
            console.log("CartProvider: Cart updated:", updatedCart);
        } catch (error) {
            console.error('CartProvider: Error adding to cart:', error.message);
            if (error.message.includes('Unauthorized')) {
                console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                localStorage.removeItem('token');
                message.error('Session expired. Please log in again.');
                navigate('/login');
            }
            throw error;
        }
    };

    const removeItemFromCart = async (productId) => {
        try {
            console.log("CartProvider: Removing from cart:", { productId });
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("CartProvider: No token, redirecting to /login");
                message.error('Please log in to remove items from cart.');
                navigate('/login');
                throw new Error('Please log in to remove items from cart.');
            }
            const updatedCart = await removeFromCart(token, productId);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
            console.log("CartProvider: Cart updated:", updatedCart);
        } catch (error) {
            console.error('CartProvider: Error removing from cart:', error.message);
            if (error.message.includes('Unauthorized')) {
                console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                localStorage.removeItem('token');
                message.error('Session expired. Please log in again.');
                navigate('/login');
            }
            throw error;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            console.log("CartProvider: Updating cart item:", { productId, quantity });
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("CartProvider: No token, redirecting to /login");
                message.error('Please log in to update cart.');
                navigate('/login');
                throw new Error('Please log in to update cart.');
            }
            const updatedCart = await updateCart(token, productId, quantity);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
            console.log("CartProvider: Cart updated:", updatedCart);
        } catch (error) {
            console.error('CartProvider: Error updating cart:', error.message);
            if (error.message.includes('Unauthorized')) {
                console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                localStorage.removeItem('token');
                message.error('Session expired. Please log in again.');
                navigate('/login');
            }
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            console.log("CartProvider: Clearing cart");
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("CartProvider: No token, redirecting to /login");
                message.error('Please log in to clear cart.');
                navigate('/login');
                throw new Error('Please log in to clear cart.');
            }
            if (!cart.items || cart.items.length === 0) {
                console.log("CartProvider: Cart already empty");
                setCart({ items: [] });
                return;
            }

            // Try bulk clear first
            try {
                await clearCartApi(token);
                setCart({ items: [] });
                console.log("CartProvider: Cart cleared via bulk API");
                return;
            } catch (bulkError) {
                console.warn('CartProvider: Bulk clear failed, falling back to individual removes:', bulkError.message);
                if (bulkError.message.includes('Unauthorized')) {
                    console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                    localStorage.removeItem('token');
                    message.error('Session expired. Please log in again.');
                    navigate('/login');
                    throw bulkError;
                }
            }

            // Fallback to individual removes
            for (const item of cart.items) {
                if (!item.product?._id) {
                    console.warn('CartProvider: Invalid product ID in cart item:', item);
                    continue;
                }
                try {
                    await removeFromCart(token, item.product._id);
                } catch (itemError) {
                    console.error(`CartProvider: Failed to remove item ${item.product._id}:`, itemError.message);
                    if (itemError.message.includes('Unauthorized')) {
                        console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                        localStorage.removeItem('token');
                        message.error('Session expired. Please log in again.');
                        navigate('/login');
                        throw itemError;
                    }
                }
            }
            setCart({ items: [] });
            console.log("CartProvider: Cart cleared via individual removes");
        } catch (error) {
            console.error('CartProvider: Error clearing cart:', error.message);
            throw error;
        }
    };

    const fetchCart = async (token) => {
        try {
            console.log("CartProvider: Fetching cart");
            const cartData = await getCart(token);
            setCart({ ...cartData, items: cartData.items || [] });
            console.log("CartProvider: Cart fetched:", cartData);
        } catch (error) {
            console.error('CartProvider: Error fetching cart:', error.message);
            if (error.message.includes('Unauthorized')) {
                console.log("CartProvider: Unauthorized, clearing token and redirecting to /login");
                localStorage.removeItem('token');
                message.error('Session expired. Please log in again.');
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
