"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCart } from "./CartContext"
import { createOrder } from "../../api"
import { message, Spin, Modal, Tooltip, Divider, Input, Empty, Alert } from "antd"
import {
    DeleteOutlined,
    ShoppingOutlined,
    TagOutlined,
    QuestionCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons"

// Custom button component to ensure consistent styling
const GreenButton = ({ children, type = "default", className = "", ...props }) => {
    const baseClasses = "flex items-center justify-center rounded-md transition-colors"

    const typeClasses = {
        primary: "bg-green-700 hover:bg-green-800 text-white border-green-700",
        default: "border border-gray-300 hover:border-green-700 hover:text-green-700",
        text: "border-0 hover:bg-gray-100",
        link: "border-0 text-green-700 hover:text-green-800 hover:underline",
    }

    return (
        <button className={`${baseClasses} ${typeClasses[type]} ${className}`} {...props}>
            {children}
        </button>
    )
}

const CartPage = () => {
    const navigate = useNavigate()
    const { cart, updateCart, fetchCart, clearCart } = useCart()
    const [promoCode, setPromoCode] = useState("")
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [checkingOut, setCheckingOut] = useState(false)
    const [error, setError] = useState(null)
    const [savedItems, setSavedItems] = useState([])
    const { confirm } = Modal

    useEffect(() => {
        const loadCart = async () => {
            // Only show loading indicator on initial load, not during updates
            if (!cart.items) {
                setLoading(true)
            }
            setError(null)

            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    navigate("/login")
                    return
                }

                // Check if we already have cart data to avoid unnecessary reloads
                if (!cart.items || cart.items.length === 0) {
                    await fetchCart(token)
                }
            } catch (err) {
                setError(err.message || "Failed to load cart")
                if (err.message?.includes("Unauthorized")) {
                    navigate("/login")
                }
            } finally {
                setLoading(false)
            }
        }

        loadCart()
        // Only depend on fetchCart and navigate, not cart
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchCart, navigate])

    // Modify the handleQuantityChange function to avoid full reloads
    const handleQuantityChange = async (productId, quantity) => {
        setUpdating(true)
        try {
            await updateCart(productId, quantity)
            if (quantity === 0) {
                message.success("Item removed from cart")
            }
        } catch (error) {
            message.error(`Failed to update cart: ${error.message}`)
            if (error.message?.includes("Unauthorized")) {
                navigate("/login")
            }
        } finally {
            setUpdating(false)
        }
    }

    // Modify the handleClearCart function to avoid full reloads
    const handleClearCart = async () => {
        setUpdating(true)
        try {
            await clearCart()
            message.success("Cart cleared successfully.")
        } catch (error) {
            message.error(`Failed to clear cart: ${error.message}`)
            if (error.message?.includes("Unauthorized")) {
                navigate("/login")
            }
        } finally {
            setUpdating(false)
        }
    }

    const showDeleteConfirm = (productId, productName) => {
        confirm({
            title: "Remove Item",
            icon: <ExclamationCircleOutlined />,
            content: `Are you sure you want to remove "${productName}" from your cart?`,
            okText: "Yes, Remove",
            okType: "danger",
            cancelText: "No, Keep",
            onOk() {
                handleQuantityChange(productId, 0)
            },
        })
    }

    const showClearCartConfirm = () => {
        confirm({
            title: "Clear Cart",
            icon: <ExclamationCircleOutlined />,
            content: "Are you sure you want to remove all items from your cart?",
            okText: "Yes, Clear Cart",
            okType: "danger",
            cancelText: "No, Keep Items",
            onOk() {
                handleClearCart()
            },
        })
    }

    const handleCheckout = async () => {
        setCheckingOut(true)
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                navigate("/login")
                throw new Error("Please log in to checkout.")
            }
            if (!cart.items || cart.items.length === 0) throw new Error("Cart is empty.")

            const orderData = {
                products: cart.items.map((item) => ({
                    productId: item.product._id,
                    quantity: item.quantity,
                })),
            }

            const order = await createOrder(token, orderData)
            try {
                await clearCart()
            } catch (clearError) {
                console.error("Failed to clear cart after order:", clearError)
                message.warning("Order placed, but failed to clear cart. Please clear it manually.")
                if (clearError.message?.includes("Unauthorized")) {
                    navigate("/login")
                    return
                }
            }
            message.success("Order placed successfully!")
            navigate(`/orders/${order._id}`)
        } catch (error) {
            message.error(error.message || "Failed to create order.")
            if (error.message?.includes("Unauthorized")) {
                navigate("/login")
            }
        } finally {
            setCheckingOut(false)
        }
    }

    const handleApplyPromo = () => {
        if (promoCode) {
            message.success(`Promo code "${promoCode}" applied! (Placeholder)`)
            setPromoCode("")
        } else {
            message.error("Please enter a promo code.")
        }
    }

    const handleSaveForLater = (item) => {
        setSavedItems([...savedItems, item])
        handleQuantityChange(item.product._id, 0)
        message.success(`${item.product.name} saved for later`)
    }

    const handleMoveToCart = (item, index) => {
        handleQuantityChange(item.product._id, 1)
        const newSavedItems = [...savedItems]
        newSavedItems.splice(index, 1)
        setSavedItems(newSavedItems)
        message.success(`${item.product.name} moved to cart`)
    }

    const calculateSubtotal = () => {
        if (!cart.items || cart.items.length === 0) return 0
        return cart.items.reduce((total, item) => {
            const price = item.product.isOnSale ? item.product.salePrice : item.product.price
            return total + price * item.quantity
        }, 0)
    }

    const calculateSavings = () => {
        if (!cart.items || cart.items.length === 0) return 0
        return cart.items.reduce((total, item) => {
            if (item.product.isOnSale) {
                return total + (item.product.price - item.product.salePrice) * item.quantity
            }
            return total
        }, 0)
    }

    const getSafeImageUrl = (url) => {
        if (!url || typeof url !== "string" || url.trim() === "") {
            return "https://via.placeholder.com/100"
        }
        if (url.startsWith("/")) {
            return `http://localhost:3000${url}`
        }
        try {
            new URL(url)
            return url
        } catch {
            return "https://via.placeholder.com/100"
        }
    }

    const shippingCost = 5.99
    const tax = calculateSubtotal() * 0.08 // Assuming 8% tax
    const total = calculateSubtotal() + shippingCost + tax

    // Get today's date and add 3-5 days for delivery estimate
    const today = new Date()
    const deliveryStart = new Date(today)
    deliveryStart.setDate(today.getDate() + 3)
    const deliveryEnd = new Date(today)
    deliveryEnd.setDate(today.getDate() + 5)

    const formatDate = (date) => {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }

    const validItems =
        cart.items && Array.isArray(cart.items) ? cart.items.filter((item) => item.product && item.product._id) : []

    const totalItems = validItems.reduce((sum, item) => sum + item.quantity, 0)

    if (loading) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
                <div className="flex justify-center items-center py-12">
                    <Spin size="large" tip="Loading your cart..." />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Your Cart</h1>
                <Alert
                    message="Error Loading Cart"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <GreenButton type="primary" onClick={() => window.location.reload()} className="px-4 py-1">
                            Try Again
                        </GreenButton>
                    }
                />
            </div>
        )
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Your Cart</h1>

            {validItems.length > 0 ? (
                <>
                    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
                        <div className="flex items-center text-gray-600">
                            <ClockCircleOutlined className="mr-2" />
                            <span>
                                Estimated delivery:{" "}
                                <strong>
                                    {formatDate(deliveryStart)} - {formatDate(deliveryEnd)}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    {totalItems} Item{totalItems !== 1 ? "s" : ""} in Cart
                                </h2>
                                <GreenButton
                                    type="text"
                                    onClick={showClearCartConfirm}
                                    disabled={updating}
                                    className="text-red-500 hover:text-red-700 px-3 py-1 flex items-center"
                                >
                                    <DeleteOutlined className="mr-1" /> Clear Cart
                                </GreenButton>
                            </div>

                            <Spin spinning={updating} tip="Updating cart...">
                                <div className="space-y-4">
                                    {validItems.map((item) => (
                                        <div
                                            key={item.product._id}
                                            className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                <div className="relative mb-4 sm:mb-0">
                                                    <img
                                                        src={getSafeImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                                        alt={item.product.name}
                                                        className="w-full sm:w-24 h-24 object-cover rounded-md"
                                                    />
                                                    {item.product.isOnSale && (
                                                        <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-tl-md rounded-br-md">
                                                            SALE
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 sm:ml-4">
                                                    <div className="flex flex-col sm:flex-row justify-between">
                                                        <div>
                                                            <h2 className="text-lg font-semibold text-gray-800">{item.product.name}</h2>
                                                            <div className="flex items-center mt-1">
                                                                {item.product.isOnSale ? (
                                                                    <>
                                                                        <span className="text-red-600 font-medium mr-2">
                                                                            ${item.product.salePrice.toFixed(2)}
                                                                        </span>
                                                                        <span className="text-gray-500 line-through text-sm">
                                                                            ${item.product.price.toFixed(2)}
                                                                        </span>
                                                                        <span className="ml-2 text-green-600 text-sm">
                                                                            Save ${(item.product.price - item.product.salePrice).toFixed(2)}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-700 font-medium">${item.product.price.toFixed(2)}</span>
                                                                )}
                                                            </div>
                                                            {item.product.stock <= 5 && (
                                                                <p className="text-orange-500 text-sm mt-1">Only {item.product.stock} left in stock</p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col items-end mt-4 sm:mt-0">
                                                            <p className="text-gray-800 font-semibold">
                                                                $
                                                                {(
                                                                    (item.product.isOnSale ? item.product.salePrice : item.product.price) * item.quantity
                                                                ).toFixed(2)}
                                                            </p>

                                                            <div className="flex mt-2">
                                                                <Tooltip title="Save for later">
                                                                    <GreenButton
                                                                        type="text"
                                                                        onClick={() => handleSaveForLater(item)}
                                                                        className="text-gray-500 hover:text-gray-700 px-2 py-1"
                                                                    >
                                                                        <TagOutlined />
                                                                    </GreenButton>
                                                                </Tooltip>
                                                                <Tooltip title="Remove item">
                                                                    <GreenButton
                                                                        type="text"
                                                                        onClick={() => showDeleteConfirm(item.product._id, item.product.name)}
                                                                        className="text-red-500 hover:text-red-700 px-2 py-1"
                                                                    >
                                                                        <DeleteOutlined />
                                                                    </GreenButton>
                                                                </Tooltip>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 flex items-center">
                                                        <span className="mr-3 text-gray-600">Quantity:</span>
                                                        <div className="flex items-center border rounded-md">
                                                            <GreenButton
                                                                type="text"
                                                                disabled={item.quantity <= 1}
                                                                onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                                                className="px-3 py-1 border-r"
                                                            >
                                                                -
                                                            </GreenButton>
                                                            <span className="px-4 py-1">{item.quantity}</span>
                                                            <GreenButton
                                                                type="text"
                                                                disabled={item.quantity >= item.product.stock}
                                                                onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                                                className="px-3 py-1 border-l"
                                                            >
                                                                +
                                                            </GreenButton>
                                                        </div>
                                                        {item.quantity >= item.product.stock && (
                                                            <span className="ml-3 text-orange-500 text-sm">Max quantity</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Spin>

                            {/* Saved for Later Section */}
                            {savedItems.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Saved for Later ({savedItems.length})</h2>
                                    <div className="space-y-4">
                                        {savedItems.map((item, index) => (
                                            <div
                                                key={`saved-${item.product._id}-${index}`}
                                                className="bg-white shadow-sm rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-100"
                                            >
                                                <div className="flex items-center">
                                                    <img
                                                        src={getSafeImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                                        alt={item.product.name}
                                                        className="w-16 h-16 object-cover rounded-md mr-4"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-medium">{item.product.name}</h3>
                                                        <p className="text-gray-600">
                                                            $
                                                            {item.product.isOnSale
                                                                ? item.product.salePrice.toFixed(2)
                                                                : item.product.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <GreenButton
                                                        type="primary"
                                                        onClick={() => handleMoveToCart(item, index)}
                                                        className="px-4 py-2"
                                                    >
                                                        Move to Cart
                                                    </GreenButton>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex justify-between">
                                <GreenButton onClick={() => navigate("/")} className="px-4 py-2 flex items-center">
                                    <ShoppingOutlined className="mr-2" /> Continue Shopping
                                </GreenButton>

                                <GreenButton
                                    type="primary"
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    className="px-4 py-2 md:hidden"
                                >
                                    {checkingOut ? "Processing..." : "Proceed to Checkout"}
                                </GreenButton>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                        <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                    </div>

                                    {calculateSavings() > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Savings</span>
                                            <span>-${calculateSavings().toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">${shippingCost.toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="flex items-center">
                                            <span className="text-gray-600">Estimated Tax</span>
                                            <Tooltip title="Tax calculated at checkout based on delivery address">
                                                <QuestionCircleOutlined className="ml-1 text-gray-400" />
                                            </Tooltip>
                                        </div>
                                        <span className="font-medium">${tax.toFixed(2)}</span>
                                    </div>

                                    <Divider className="my-3" />

                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-800 font-semibold">Total</span>
                                        <span className="text-gray-800 font-semibold">${total.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label htmlFor="promo" className="text-gray-600 text-sm">
                                            Promo Code
                                        </label>
                                        <span className="text-sm text-green-700 cursor-pointer hover:underline">Have a promo code?</span>
                                    </div>
                                    <div className="flex">
                                        <Input
                                            id="promo"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value)}
                                            placeholder="Enter promo code"
                                            className="rounded-r-none"
                                        />
                                        <GreenButton type="primary" onClick={handleApplyPromo} className="rounded-l-none px-4 py-1">
                                            Apply
                                        </GreenButton>
                                    </div>
                                </div>

                                <GreenButton
                                    type="primary"
                                    onClick={handleCheckout}
                                    disabled={checkingOut}
                                    className="w-full mt-6 py-3 text-base font-medium"
                                >
                                    {checkingOut ? "Processing..." : "Proceed to Checkout"}
                                </GreenButton>

                                <div className="mt-4 text-center text-sm text-gray-500">
                                    <p>Free shipping on orders over $50</p>
                                    <p className="mt-1">30-day easy returns</p>
                                </div>

                                <div className="mt-4 flex justify-center space-x-4">
                                    <img src="https://via.placeholder.com/40x25?text=Visa" alt="Visa" className="h-6" />
                                    <img src="https://via.placeholder.com/40x25?text=MC" alt="Mastercard" className="h-6" />
                                    <img src="https://via.placeholder.com/40x25?text=Amex" alt="American Express" className="h-6" />
                                    <img src="https://via.placeholder.com/40x25?text=PayPal" alt="PayPal" className="h-6" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white shadow-sm rounded-lg p-8 text-center">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div className="space-y-2">
                                <h2 className="text-2xl font-semibold text-gray-700">Your Cart is Empty</h2>
                                <p className="text-gray-600">Looks like you haven't added anything to your cart yet.</p>
                            </div>
                        }
                    >
                        <div className="mt-6 flex justify-center">
                            <GreenButton
                                type="primary"
                                onClick={() => navigate("/")}
                                className="px-5 py-2 text-base flex items-center"
                            >
                                <ShoppingOutlined className="mr-2" /> Start Shopping
                            </GreenButton>
                        </div>

                        {savedItems.length > 0 && (
                            <div className="mt-8">
                                <Divider>Saved for Later ({savedItems.length})</Divider>
                                <div className="space-y-4 mt-4">
                                    {savedItems.map((item, index) => (
                                        <div
                                            key={`saved-empty-${item.product._id}-${index}`}
                                            className="bg-gray-50 rounded-lg p-4 max-w-md mx-auto"
                                        >
                                            <div className="flex items-center">
                                                <img
                                                    src={getSafeImageUrl(item.product.imageUrl) || "/placeholder.svg"}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 object-cover rounded-md mr-4"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-medium">{item.product.name}</h3>
                                                    <p className="text-gray-600">
                                                        ${item.product.isOnSale ? item.product.salePrice.toFixed(2) : item.product.price.toFixed(2)}
                                                    </p>
                                                </div>
                                                <GreenButton type="primary" onClick={() => handleMoveToCart(item, index)} className="px-4 py-2">
                                                    Add to Cart
                                                </GreenButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Empty>
                </div>
            )}
        </div>
    )
}

export default CartPage
