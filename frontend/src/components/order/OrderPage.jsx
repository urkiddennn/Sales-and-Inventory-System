
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrders, cancelOrder } from "../../api";
import { message, Spin, Steps, Divider, Tag } from "antd";
import { ShoppingCartOutlined, CheckCircleOutlined, CarOutlined, HomeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import GreenButton from "./green-button";
import CancelOrderModal from "./CancelOrderModal";

const OrderPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.error("No token found in localStorage");
                    message.error("Please log in to view orders.");
                    navigate("/login");
                    return;
                }
                console.log('Fetching order with ID:', id, { token });
                const orders = await getOrders(token);
                const foundOrder = orders.find((o) => o._id === id);
                if (foundOrder) {
                    console.log('Order found:', foundOrder);
                    setOrder(foundOrder);
                } else {
                    console.error('Order not found for ID:', id);
                    message.error("Order not found");
                    navigate("/orders");
                }
            } catch (error) {
                console.error('Fetch order error:', error.message, error);
                if (error.message.includes("Unauthorized")) {
                    console.log("Unauthorized error, clearing token and redirecting to login");
                    localStorage.removeItem("token");
                    navigate("/login");
                }
                message.error(error.message || "Failed to fetch order");
                navigate("/orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, navigate]);

    const getStatusProgress = (status) => {
        const statuses = ["pending", "processing", "shipped", "delivered"];
        return statuses.indexOf(status);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <ShoppingCartOutlined />;
            case "processing":
                return <CheckCircleOutlined />;
            case "shipped":
                return <CarOutlined />;
            case "delivered":
                return <HomeOutlined />;
            default:
                return <ShoppingCartOutlined />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "orange";
            case "processing":
            case "shipped":
            case "delivered":
                return "green";
            case "cancelled":
                return "red";
            default:
                return "default";
        }
    };

    const calculateSubtotal = () => {
        if (!order || !order.products) return 0;
        return order.products.reduce((total, item) => total + item.price * item.quantity, 0);

    };
    const handleCancelOrder = async () => {
        console.log("Initiating order cancellation for ID:", id);
        setCancelling(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found in localStorage");
                message.error("Please log in to cancel order.");
                navigate("/login");
                return;
            }
            console.log("Calling cancelOrder with token and ID:", { token, id });
            const updatedOrder = await cancelOrder(token, id);
            console.log("Received updated order:", updatedOrder);
            setOrder(updatedOrder);
            message.success("Order cancelled successfully");
            // Refresh order data to ensure UI syncs with backend
            const orders = await getOrders(token);
            const refreshedOrder = orders.find((o) => o._id === id);
            if (refreshedOrder) {
                console.log("Refreshed order:", refreshedOrder);
                setOrder(refreshedOrder);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Cancel order error:", error.message, error);
            message.error(error.message || "Failed to cancel order");
            if (error.message.includes("Unauthorized")) {
                console.log("Unauthorized error, clearing token and redirecting to login");
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setCancelling(false);
        }
    };

    const showCancelConfirm = () => {
        console.log("Opening cancel confirmation modal for order ID:", id);
        setIsModalOpen(true);
    };

    const handleCancelModalClose = () => {
        console.log("Cancel modal closed for order ID:", id);
        setIsModalOpen(false);
    };

    const handleCancelButtonClick = () => {
        console.log("Cancel Order button clicked for order ID:", id);
        showCancelConfirm();
    };

    const shippingCost = 5.99;
    const tax = calculateSubtotal() * 0.08;
    const total = calculateSubtotal() + shippingCost + tax;
    console.log(order)

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!order) {
        return (
            <div className="text-center py-12 max-w-3xl mx-auto">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Not Found</h2>
                <GreenButton type="primary" onClick={() => navigate("/orders")}>
                    Back to Orders
                </GreenButton>
            </div>
        );
    }

    console.log("Rendering OrderPage with order:", { id, status: order.status });

    const orderDate = new Date(order.createdAt);
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    return (
        <div className="p-4 max-w-4xl mx-auto min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">
                    Order #{order._id}
                </h1>
                <div className="flex gap-2">
                    <GreenButton type="text" onClick={() => navigate("/orders")} className="flex items-center">
                        <ArrowLeftOutlined className="mr-1" /> Back
                    </GreenButton>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Left Column - Order Info */}
                <div className="md:col-span-2 space-y-4">
                    {/* Order Status */}
                    <div className="bg-white p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-3">Status</h2>
                        <Steps
                            current={getStatusProgress(order.status)}
                            items={[
                                { title: "Pending", icon: <ShoppingCartOutlined /> },
                                { title: "Processing", icon: <CheckCircleOutlined /> },
                                { title: "Shipped", icon: <CarOutlined /> },
                                { title: "Delivered", icon: <HomeOutlined /> },
                            ]}
                            className="mb-2"
                        />
                        <Tag color={getStatusColor(order.status)} className="capitalize">
                            {getStatusIcon(order.status)} {order.status}
                        </Tag>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-3">Items</h2>
                        {order.products.map((item) => (
                            <div key={item.product._id} className="flex items-center py-2 border-b last:border-b-0">
                                <img
                                    src={item.product.imageUrl || "/placeholder.svg"}
                                    alt={item.product.name}
                                    className="w-12 h-12 object-cover rounded-md mr-3"
                                />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                                    <p className="text-gray-600 text-xs">
                                        ${item.price.toFixed(2)} × {item.quantity}
                                    </p>
                                </div>
                                <p className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>

                    {/* Shipping Information */}
                    <div className="bg-white p-4 rounded-md">
                        <h2 className="text-lg font-medium mb-3">Shipping</h2>
                        <div className="text-sm text-gray-600">
                            <p>{order.shippingAddress?.fullName || "John Doe"}</p>
                            <p>{order.shippingAddress?.street || "123 Main St"}</p>
                            <p>
                                {order.shippingAddress?.city || "Anytown"}, {order.shippingAddress?.state || "CA"}{" "}
                                {order.shippingAddress?.zipCode || "12345"}
                            </p>
                            <p className="mt-2">
                                <strong>Estimated Delivery:</strong> {deliveryDate.toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column - Summary */}
                <div className="bg-white p-4 rounded-md">
                    <h2 className="text-lg font-medium mb-3">Summary</h2>
                    <div className="text-sm space-y-2">
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
                        <Divider className="my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                    </div>
                    {order.status !== "cancelled" && (
                        <GreenButton
                            type="text"
                            onClick={handleCancelButtonClick}
                            className="text-red-500 w-full border border-gray-400 mt-2 hover:text-red-600"
                            disabled={cancelling}
                        >
                            {cancelling ? <Spin size="small" /> : "Cancel Order"}
                        </GreenButton>
                    )}
                    <CancelOrderModal
                        visible={isModalOpen}
                        onConfirm={handleCancelOrder}
                        onCancel={handleCancelModalClose}
                        loading={cancelling}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrderPage;
