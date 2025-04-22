

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "./CartContext";
import { createOrder } from "../../api";
import { message, Spin, Divider } from "antd";
import { DeleteOutlined, ShoppingOutlined } from "@ant-design/icons";
import GreenButton from "../products/green-button";
import RemoveItemModal from "./RemoveItemModal";

const CartPage = () => {
    const navigate = useNavigate();
    const { cart, updateCart, removeFromCart, fetchCart, clearCart } = useCart();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState(null);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    const [itemToRemove, setItemToRemove] = useState(null);

    useEffect(() => {
        const loadCart = async () => {
            if (!cart.items) setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("CartPage: No token, redirecting to /login");
                    navigate("/login");
                    return;
                }
                if (!cart.items || cart.items.length === 0) {
                    console.log("CartPage: Fetching cart");
                    await fetchCart(token);
                }
            } catch (err) {
                console.error("CartPage: Error loading cart:", err.message);
                setError(err.message || "Failed to load cart");
                if (err.message?.includes("Unauthorized")) {
                    console.log("CartPage: Unauthorized, redirecting to /login");
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };
        loadCart();
    }, [fetchCart, navigate, cart.items]);

    const handleQuantityChange = async (productId, quantity) => {
        setUpdating(true);
        try {
            console.log("CartPage: Updating quantity:", { productId, quantity });
            await updateCart(productId, quantity);
            message.success(quantity === 0 ? "Item removed" : "Quantity updated");
        } catch (error) {
            console.error("CartPage: Error updating cart:", error.message);
            message.error("Failed to update cart");
            if (error.message?.includes("Unauthorized")) {
                console.log("CartPage: Unauthorized, redirecting to /login");
                navigate("/login");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleRemoveItem = async (productId, productName) => {
        setUpdating(true);
        try {
            console.log("CartPage: Removing item:", { productId, productName });
            await removeFromCart(productId);
            message.success(`${productName} removed from cart`);
            setIsRemoveModalOpen(false);
            setItemToRemove(null);
        } catch (error) {
            console.error("CartPage: Error removing item:", error.message);
            message.error(error.message || "Failed to remove item");
            if (error.message?.includes("Unauthorized")) {
                console.log("CartPage: Unauthorized, redirecting to /login");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setUpdating(false);
        }
    };

    const handleClearCart = async () => {
        setUpdating(true);
        try {
            console.log("CartPage: Clearing cart");
            await clearCart();
            message.success("Cart cleared");
        } catch (error) {
            console.error("CartPage: Error clearing cart:", error.message);
            message.error(error.message || "Failed to clear cart");
            if (error.message?.includes("Unauthorized")) {
                console.log("CartPage: Unauthorized, redirecting to /login");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setUpdating(false);
        }
    };

    const showDeleteConfirm = (productId, productName) => {
        console.log("CartPage: Opening remove confirmation modal:", { productId, productName });
        setItemToRemove({ productId, productName });
        setIsRemoveModalOpen(true);
    };

    const handleRemoveModalClose = () => {
        console.log("CartPage: Remove modal closed");
        setIsRemoveModalOpen(false);
        setItemToRemove(null);
    };

    const handleCheckout = async () => {
        setCheckingOut(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Please log in");
            }
            if (!cart.items || cart.items.length === 0) {
                throw new Error("Cart is empty");
            }
            console.log("Cart items:", cart.items); // Log cart items
            const orderData = {
                products: cart.items.map((item) => ({
                    product: item.product._id,
                    quantity: item.quantity,
                    price: item.product.isOnSale ? item.product.salePrice : item.product.price,
                })),
                shippingAddress: {
                    fullName: "John Doe",
                    street: "123 Main St",
                    city: "Anytown",
                    state: "CA",
                    zipCode: "12345",
                },
            };
            console.log("CartPage: Creating order:", orderData);
            const order = await createOrder(token, orderData);
            await clearCart();
            message.success("Order placed");
            navigate(`/orders/${order._id}`);
        } catch (error) {
            console.error("CartPage: Error creating order:", error.message);
            message.error(error.message || "Failed to create order");
            if (error.message?.includes("Unauthorized")) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setCheckingOut(false);
        }
    };

    const calculateSubtotal = () => {
        if (!cart.items || cart.items.length === 0) return 0;
        return cart.items.reduce((total, item) => {
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price;
            return total + price * item.quantity;
        }, 0);
    };

    const shippingCost = 5.99;
    const tax = calculateSubtotal() * 0.08;
    const total = calculateSubtotal() + shippingCost + tax;

    const validItems = cart.items && Array.isArray(cart.items) ? cart.items.filter((item) => item.product && item.product._id) : [];
    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-3xl mx-auto text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Error Loading Cart</h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <GreenButton type="primary" onClick={() => window.location.reload()}>
                    Try Again
                </GreenButton>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Cart</h1>

            {validItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-medium">{totalItems} Item{totalItems !== 1 ? "s" : ""}</h2>
                            <GreenButton type="text" onClick={handleClearCart} className="text-red-500">
                                Clear Cart
                            </GreenButton>
                        </div>

                        <Spin spinning={updating}>
                            {validItems.map((item) => (
                                <div key={item.product._id} className="bg-white p-3 rounded-md flex items-center">
                                    <img
                                        src={item.product.imageUrl || "/placeholder.svg"}
                                        alt={item.product.name}
                                        className="w-16 h-16 object-cover rounded-md mr-3"
                                    />
                                    <div className="flex-1">
                                        <h3 className="text-sm font-medium">{item.product.name}</h3>
                                        <p className="text-gray-600 text-xs">
                                            ${(item.product.isOnSale ? item.product.salePrice : item.product.price).toFixed(2)} × {item.quantity}
                                        </p>
                                        <div className="flex items-center mt-1">
                                            <GreenButton
                                                type="text"
                                                disabled={item.quantity <= 1}
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                className="px-2"
                                            >
                                                -
                                            </GreenButton>
                                            <span className="px-2">{item.quantity}</span>
                                            <GreenButton
                                                type="text"
                                                disabled={item.quantity >= item.product.stock}
                                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                className="px-2"
                                            >
                                                +
                                            </GreenButton>
                                        </div>
                                    </div>
                                    <GreenButton
                                        type="text"
                                        onClick={() => showDeleteConfirm(item.product._id, item.product.name)}
                                        className="text-red-500"
                                    >
                                        <DeleteOutlined />
                                    </GreenButton>
                                </div>
                            ))}
                        </Spin>

                        <GreenButton onClick={() => navigate("/")} className="flex items-center">
                            <ShoppingOutlined className="mr-1" /> Continue Shopping
                        </GreenButton>
                    </div>

                    <div className="bg-white p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-3">Summary</h2>
                        <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                <span>${calculateSubtotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shipping</span>
                                <span>${shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span>${tax.toFixed(2)}</span>
                            </div>
                            <Divider className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                        <GreenButton type="primary" onClick={handleCheckout} disabled={checkingOut} className="w-full mt-4">
                            {checkingOut ? "Processing..." : "Checkout"}
                        </GreenButton>
                    </div>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-md text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Cart is Empty</h2>
                    <GreenButton type="primary" onClick={() => navigate("/")} className="flex items-center mx-auto">
                        <ShoppingOutlined className="mr-1" /> Start Shopping
                    </GreenButton>
                </div>
            )}

            {itemToRemove && (
                <RemoveItemModal
                    visible={isRemoveModalOpen}
                    productName={itemToRemove.productName}
                    onConfirm={() => handleRemoveItem(itemToRemove.productId, itemToRemove.productName)}
                    onCancel={handleRemoveModalClose}
                    loading={updating}
                />
            )}
        </div>
    );
};

export default CartPage;
