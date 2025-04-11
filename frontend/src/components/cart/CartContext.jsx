import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart as fetchCartFromApi, addToCart as addToCartApi, removeFromCart as removeFromCartApi, updateCart as updateCartApi } from "../../api/";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState({ items: [] });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart(token);
        }
    }, []);

    const addItemToCart = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Please log in to add items to cart.');
            const updatedCart = await addToCartApi(token, { productId, quantity });
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    };

    const removeItemFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Please log in to remove items from cart.');
            const updatedCart = await removeFromCartApi(token, productId);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    };

    const updateCartItem = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Please log in to update cart.');
            const updatedCart = await updateCartApi(token, productId, quantity);
            console.log('Updated cart response:', updatedCart);
            setCart({ ...updatedCart, items: updatedCart.items || [] });
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    };

    const fetchCart = async (token) => {
        try {
            const cartData = await fetchCartFromApi(token);
            setCart({ ...cartData, items: cartData.items || [] });
        } catch (error) {
            console.error("Error fetching cart:", error);
            setCart({ items: [] });
        }
    };

    return (
        <CartContext.Provider value={{ cart, addToCart: addItemToCart, removeFromCart: removeItemFromCart, updateCart: updateCartItem, fetchCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};
