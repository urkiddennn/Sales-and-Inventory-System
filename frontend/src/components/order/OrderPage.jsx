"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getOrders } from "../../api"
import { message, Spin, Steps, Divider, Tag, Timeline, Card, Tooltip } from "antd"
import {
    ShoppingCartOutlined,
    CheckCircleOutlined,
    CarOutlined,
    HomeOutlined,
    ArrowLeftOutlined,
    PrinterOutlined,
    DownloadOutlined,
    QuestionCircleOutlined,
} from "@ant-design/icons"
import GreenButton from "./green-button"

const OrderPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    message.error("Please log in to view orders.")
                    navigate("/login")
                    return
                }
                const orders = await getOrders(token)
                const foundOrder = orders.find((o) => o._id === id)
                if (foundOrder) {
                    setOrder(foundOrder)
                } else {
                    message.error("Order not found")
                    navigate("/orders")
                }
            } catch (error) {
                message.error("Failed to fetch order")
                navigate("/orders")
            } finally {
                setLoading(false)
            }
        }
        fetchOrder()
    }, [id, navigate])

    const getStatusProgress = (status) => {
        const statuses = ["pending", "processing", "shipped", "delivered"]
        return statuses.indexOf(status)
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <ShoppingCartOutlined />
            case "processing":
                return <CheckCircleOutlined />
            case "shipped":
                return <CarOutlined />
            case "delivered":
                return <HomeOutlined />
            default:
                return <ShoppingCartOutlined />
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "orange"
            case "processing":
                return "green"
            case "shipped":
                return "green"
            case "delivered":
                return "green"
            default:
                return "default"
        }
    }

    const calculateSubtotal = () => {
        if (!order || !order.products) return 0
        return order.products.reduce((total, item) => total + item.price * item.quantity, 0)
    }

    const shippingCost = 5.99
    const tax = calculateSubtotal() * 0.08 // Assuming 8% tax
    const total = calculateSubtotal() + shippingCost + tax

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Loading order details..." />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Order Not Found</h2>
                <p className="text-gray-600 mb-6">
                    The order you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <GreenButton type="primary" size="large" onClick={() => navigate("/orders")}>
                    Back to Orders
                </GreenButton>
            </div>
        )
    }

    // Estimated delivery date (5 days from order date)
    const orderDate = new Date(order.createdAt)
    const deliveryDate = new Date(orderDate)
    deliveryDate.setDate(deliveryDate.getDate() + 5)

    return (
        <div className="p-6 max-w-5xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    Order Details
                    <span className="ml-2 text-sm bg-gray-200 text-gray-700 py-1 px-2 rounded-md">#{order._id}</span>
                </h1>
                <div className="space-x-2 print:hidden">
                    <Tooltip title="Print Invoice">
                        <GreenButton icon={<PrinterOutlined />} onClick={handlePrint} className="border-gray-300">
                            Print
                        </GreenButton>
                    </Tooltip>
                    <Tooltip title="Download Invoice">
                        <GreenButton icon={<DownloadOutlined />} className="border-gray-300">
                            Download
                        </GreenButton>
                    </Tooltip>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Order Status */}
                    <Card className="shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Order Status</h2>
                        <Steps
                            current={getStatusProgress(order.status)}
                            items={[
                                {
                                    title: "Pending",
                                    icon: <ShoppingCartOutlined />,
                                    description: "Order placed",
                                },
                                {
                                    title: "Processing",
                                    icon: <CheckCircleOutlined />,
                                    description: "Payment confirmed",
                                },
                                {
                                    title: "Shipped",
                                    icon: <CarOutlined />,
                                    description: "On the way",
                                },
                                {
                                    title: "Delivered",
                                    icon: <HomeOutlined />,
                                    description: "Received",
                                },
                            ]}
                        />
                        <div className="mt-4 flex items-center">
                            <Tag color={getStatusColor(order.status)} className="text-sm capitalize">
                                {getStatusIcon(order.status)} {order.status}
                            </Tag>
                            <span className="ml-2 text-gray-600 text-sm">
                                Last updated: {new Date(order.updatedAt || order.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </Card>

                    {/* Order Items */}
                    <Card className="shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.products.map((item) => (
                                <div key={item.product._id} className="flex items-center border-b pb-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-md mr-4 flex-shrink-0">
                                        {item.product.imageUrl ? (
                                            <img
                                                src={item.product.imageUrl || "/placeholder.svg"}
                                                alt={item.product.name}
                                                className="w-full h-full object-cover rounded-md"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <ShoppingCartOutlined style={{ fontSize: "24px" }} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-medium">{item.product.name}</h3>
                                        <p className="text-gray-600 text-sm">
                                            ${item.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Shipping Information */}
                    <Card className="shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Shipping Address</h3>
                                <p className="text-gray-600">
                                    {order.shippingAddress?.fullName || "John Doe"}
                                    <br />
                                    {order.shippingAddress?.street || "123 Main St"}
                                    <br />
                                    {order.shippingAddress?.city || "Anytown"}, {order.shippingAddress?.state || "CA"}{" "}
                                    {order.shippingAddress?.zipCode || "12345"}
                                    <br />
                                    {order.shippingAddress?.country || "United States"}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-700 mb-2">Delivery Information</h3>
                                <p className="text-gray-600">
                                    <strong>Carrier:</strong> {order.carrier || "Standard Shipping"}
                                    <br />
                                    <strong>Tracking Number:</strong> {order.trackingNumber || "Not available yet"}
                                    <br />
                                    <strong>Estimated Delivery:</strong> {deliveryDate.toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Order Timeline */}
                    <Card className="shadow-sm print:hidden">
                        <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
                        <Timeline
                            items={[
                                {
                                    color: "green",
                                    children: (
                                        <>
                                            <p className="font-medium">Order Placed</p>
                                            <p className="text-gray-600 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                                        </>
                                    ),
                                },
                                {
                                    color: order.status === "pending" ? "gray" : "green",
                                    children: (
                                        <>
                                            <p className="font-medium">Payment Confirmed</p>
                                            <p className="text-gray-600 text-sm">
                                                {order.status !== "pending" ? new Date(order.createdAt).toLocaleString() : "Pending"}
                                            </p>
                                        </>
                                    ),
                                },
                                {
                                    color: order.status === "shipped" || order.status === "delivered" ? "green" : "gray",
                                    children: (
                                        <>
                                            <p className="font-medium">Order Shipped</p>
                                            <p className="text-gray-600 text-sm">
                                                {order.status === "shipped" || order.status === "delivered"
                                                    ? "Your order is on the way!"
                                                    : "Not shipped yet"}
                                            </p>
                                        </>
                                    ),
                                },
                                {
                                    color: order.status === "delivered" ? "green" : "gray",
                                    children: (
                                        <>
                                            <p className="font-medium">Order Delivered</p>
                                            <p className="text-gray-600 text-sm">
                                                {order.status === "delivered" ? "Your order has been delivered!" : "Not delivered yet"}
                                            </p>
                                        </>
                                    ),
                                },
                            ]}
                        />
                    </Card>
                </div>

                {/* Right Column - Invoice Summary */}
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Date</span>
                                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Order Number</span>
                                <span className="font-mono">{order._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method</span>
                                <span>{order.paymentMethod || "Credit Card"}</span>
                            </div>
                            <Divider className="my-3" />
                            <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
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
                            <Divider className="my-3" />
                            <div className="flex justify-between font-semibold text-lg">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="shadow-sm print:hidden">
                        <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
                        <div className="space-y-4">
                            <GreenButton block className="text-left flex items-center justify-start">
                                <QuestionCircleOutlined className="mr-2" /> Track My Order
                            </GreenButton>
                            <GreenButton block className="text-left flex items-center justify-start">
                                <QuestionCircleOutlined className="mr-2" /> Return Items
                            </GreenButton>
                            <GreenButton block className="text-left flex items-center justify-start">
                                <QuestionCircleOutlined className="mr-2" /> Contact Support
                            </GreenButton>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Back to Orders */}
            <div className="mt-8 print:hidden">
                <GreenButton type="primary" icon={<ArrowLeftOutlined />} onClick={() => navigate("/orders")} size="large">
                    Back to Orders
                </GreenButton>
            </div>
        </div>
    )
}

export default OrderPage
