import React from 'react';
import { removeFromCart, addToCart } from '../api';

const ShoppingCart = ({ cart, isOpen, onClose, onUpdateCart }) => {
    if (!isOpen) return null;

    const handleQuantityChange = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('token');
            if (quantity <= 0) {
                const updatedCart = await removeFromCart(token, productId);
                onUpdateCart(updatedCart);
            } else {
                const updatedCart = await addToCart(token, { productId, quantity });
                onUpdateCart(updatedCart);
            }
        } catch (error) {
            console.error('Error updating cart:', error);
        }
    };

    return (
        <div className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                    ✕
                </button>
            </div>
            {cart.items && cart.items.length > 0 ? (
                <div>
                    {cart.items.map((item) => (
                        <div key={item.product._id} className="flex items-center mb-4 border-b pb-2">
                            <img
                                src={item.product.imageUrl || 'https://via.placeholder.com/50'}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover mr-4"
                            />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold">{item.product.name}</h3>
                                <p className="text-gray-600 text-sm">
                                    ${item.product.isOnSale ? item.product.salePrice : item.product.price} x {item.quantity}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <button
                                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                    className="text-gray-600 px-2"
                                >
                                    -
                                </button>
                                <span className="mx-2">{item.quantity}</span>
                                <button
                                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                    className="text-gray-600 px-2"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="mt-4">
                        <button className="w-full bg-green-800 text-white py-2 rounded mb-2 hover:bg-green-700">
                            View Cart
                        </button>
                        <button className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300">
                            Checkout
                        </button>
                    </div>
                </div>
            ) : (
                <p>Your cart is empty.</p>
            )}
        </div>
    );
};

export default ShoppingCart;
