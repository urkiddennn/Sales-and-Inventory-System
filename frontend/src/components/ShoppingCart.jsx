import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../components/cart/CartContext";

const ShoppingCart = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { cart, updateCart, fetchCart } = useCart();

    // Fetch cart data when the shopping cart opens
    useEffect(() => {
        if (isOpen) {
            const token = localStorage.getItem("token");
            if (token) {
                fetchCart(token);
            } else {
                navigate("/login"); // Optionally redirect to login if no token
            }
        }
    }, [isOpen, fetchCart, navigate]);

    const handleQuantityChange = async (productId, quantity) => {
        try {
            await updateCart(productId, quantity);
        } catch (error) {
            console.error("Error updating cart:", error);
            alert(`Failed to update cart: ${error.message}`);
        }
    };

    const handleViewCart = () => {
        onClose();
        navigate("/cart");
    };

    const handleCheckout = () => {
        alert("Proceeding to checkout...");
    };

    return (
        <div
            className={`fixed top-0 right-0 w-full lg:w-96 h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
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
            <div className="flex-1 overflow-y-auto px-4">
                {cart?.items?.length > 0 ? (
                    <div>
                        {cart.items.map((item) => (
                            <div key={item.product._id} className="flex items-center mb-4">
                                {item.product.imageUrl ? (
                                    <img
                                        src={item.product.imageUrl}
                                        alt={item.product.name}
                                        className="w-12 h-12 object-cover mr-4"
                                        onError={(e) => {
                                            e.target.src = "/assets/placeholder.png"; // Fallback to local placeholder
                                        }}
                                    />
                                ) : (
                                    <div className="w-12 h-12 mr-4 bg-gray-200 flex items-center justify-center text-gray-500 text-xs">
                                        No Image
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-800">{item.product.name}</h3>
                                    <div className="flex items-center mt-1">
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                            className="text-gray-600 px-2 py-1 border rounded-l hover:bg-gray-100"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="px-3 py-1 border-t border-b">{item.quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                            className="text-gray-600 px-2 py-1 border rounded-r hover:bg-gray-100"
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
                        <div className="w-32 h-32 mb-4 bg-gray-200 flex items-center justify-center text-gray-500">
                            Empty Cart
                        </div>
                        <p className="text-gray-600">Your cart is empty.</p>
                    </div>
                )}
            </div>

            {/* Buttons */}
            {cart?.items?.length > 0 && (
                <div className="p-4 border-t">
                    <button
                        onClick={handleViewCart}
                        className="w-full bg-green-800 text-white py-2 mb-2 rounded hover:bg-green-700"
                    >
                        View Cart
                    </button>
                    <button
                        onClick={handleCheckout}
                        className="w-full bg-white text-gray-800 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;
