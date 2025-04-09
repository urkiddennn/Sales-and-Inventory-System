import React from 'react';
import { useNavigate } from 'react-router-dom';
import { removeFromCart, addToCart } from '../api';

const ShoppingCart = ({ cart, isOpen, onClose, onUpdateCart }) => {
    const navigate = useNavigate();

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

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    const handleCheckout = () => {
        alert('Proceeding to checkout...');
    };

    return (
        <div
            className={`fixed top-0 right-0 w-full lg:w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 border-b-2 p-4 border-gray-500">
                <h2 className="text-xl font-bold">Shopping Cart</h2>

                <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
                    ✕
                </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
                {cart.items && cart.items.length > 0 ? (
                    <div>
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="flex items-center mb-4">
                                <img
                                    src={item.product.imageUrl || 'https://via.placeholder.com/50'}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover mr-4"
                                />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-800">{item.product.name}</h3>
                                    <div className="flex items-center mt-1">
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                            className="text-gray-600 px-2 py-1 border rounded-l"
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                            className="text-gray-600 px-2 py-1 border rounded-r"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleQuantityChange(item.product._id, 0)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                        <img
                            src={""}
                            alt="Empty Cart"
                            className="w-32 h-32 mb-4"
                        />
                        <p className="text-gray-600">Your cart is empty.</p>
                    </div>
                )}
            </div>

            {/* Buttons */}
            {cart.items && cart.items.length > 0 && (
                <div className="mt-4">
                    <button
                        onClick={handleViewCart}
                        className="w-full bg-green-800 text-white py-2 mb-2 hover:bg-green-700"
                    >
                        View Cart
                    </button>
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-white text-gray-800 py-2  border border-gray-300 hover:bg-gray-100"
                    >
                        Checkout
                    </button>
                </div>
            )}


        </div>
    );
};

export default ShoppingCart;
