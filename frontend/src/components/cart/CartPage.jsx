import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, addToCart } from '../../api';

const CartPage = ({ cart, onUpdateCart }) => {
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('');

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

    const handleClearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            for (const item of cart.items) {
                await removeFromCart(token, item.product._id);
            }
            onUpdateCart({ items: [] });
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const handleCheckout = () => {
        alert('Proceeding to checkout...');
    };

    const handleApplyPromo = () => {
        if (promoCode) {
            alert(`Promo code "${promoCode}" applied! (Placeholder)`);
            setPromoCode('');
        } else {
            alert('Please enter a promo code.');
        }
    };

    const calculateSubtotal = () => {
        if (!cart.items || cart.items.length === 0) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price;
            return total + price * item.quantity;
        }, 0);
    };

    const shippingCost = 5.99; // Placeholder shipping cost
    const total = calculateSubtotal() + shippingCost;

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>

            {cart.items && cart.items.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-700">
                                {cart.items.length} Item{cart.items.length !== 1 ? 's' : ''} in Cart
                            </h2>
                            <button
                                onClick={handleClearCart}
                                className="text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear Cart
                            </button>
                        </div>
                        <div className="space-y-6">
                            {cart.items.map((item) => (
                                <div
                                    key={item.product._id}
                                    className="flex items-center bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
                                >
                                    <img
                                        src={item.product.imageUrl || 'https://via.placeholder.com/100'}
                                        alt={item.product.name}
                                        className="w-24 h-24 object-cover rounded-md mr-4"
                                    />
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold text-gray-800">{item.product.name}</h2>
                                        <p className="text-gray-600">
                                            ${item.product.isOnSale ? item.product.salePrice : item.product.price}
                                        </p>
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                className="text-gray-600 px-3 py-1 border rounded-l hover:bg-gray-100"
                                            >
                                                -
                                            </button>
                                            <span className="px-4 py-1 border-t border-b">{item.quantity}</span>
                                            <button
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                className="text-gray-600 px-3 py-1 border rounded-r hover:bg-gray-100"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-gray-800 font-semibold">
                                            ${(item.product.isOnSale ? item.product.salePrice : item.product.price) * item.quantity}
                                        </p>
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, 0)}
                                            className="text-gray-400 hover:text-gray-600 mt-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-md rounded-lg p-6 sticky top-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">${shippingCost.toFixed(2)}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="text-gray-800 font-semibold">Total</span>
                                    <span className="text-gray-800 font-semibold">${total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mt-6">
                                <label htmlFor="promo" className="text-gray-600 text-sm">
                                    Promo Code
                                </label>
                                <div className="flex mt-2">
                                    <input
                                        type="text"
                                        id="promo"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 border rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                        placeholder="Enter promo code"
                                    />
                                    <button
                                        onClick={handleApplyPromo}
                                        className="bg-green-800 text-white px-4 py-2 rounded-r hover:bg-green-700"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full bg-green-800 text-white py-3 rounded mt-6 hover:bg-green-700 transition-colors"
                            >
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">
                        Looks like you haven't added anything to your cart yet.
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-green-800 text-white px-6 py-3 rounded hover:bg-green-700"
                    >
                        Continue Shopping
                    </button>
                </div>
            )}
        </div>
    );
};

export default CartPage;
