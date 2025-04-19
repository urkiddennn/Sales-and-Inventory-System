"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getOrders } from "../../api";
import { message, Spin, Input, Select, Empty, Pagination, Badge, Tooltip, Card, Tabs } from "antd";
import {
    SearchOutlined,
    ShoppingOutlined,
    FilterOutlined,
    SortAscendingOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CarOutlined,
    HomeOutlined,
} from "@ant-design/icons";
import GreenButton from "./green-button";

const { Option } = Select;
const { TabPane } = Tabs;

const OrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date-desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        const fetchOrders = async () => {
            if (authLoading) return;

            if (!isAuthenticated) {
                console.log("OrdersPage: Not authenticated, redirecting to /login");
                message.error("Please log in to view orders.");
                navigate("/login");
                return;
            }

            try {
                console.log("OrdersPage: Fetching orders");
                const token = localStorage.getItem("token");
                const ordersData = await getOrders(token);
                setOrders(ordersData);
                setFilteredOrders(ordersData);
                console.log("OrdersPage: Orders fetched:", ordersData.length);
            } catch (error) {
                console.error("OrdersPage: Failed to fetch orders:", error.message);
                message.error("Failed to fetch orders");
                if (error.message && error.message.includes("Unauthorized")) {
                    navigate("/login");
                }
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate, isAuthenticated, authLoading]);

    useEffect(() => {
        console.log("OrdersPage: Applying filters and sorting", { statusFilter, searchTerm, sortBy });
        let result = [...orders];

        // Apply status filter
        if (statusFilter !== "all") {
            result = result.filter((order) => order.status === statusFilter);
        }

        // Apply search
        if (searchTerm) {
            result = result.filter(
                (order) =>
                    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (order.products &&
                        order.products.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase()))),
            );
        }

        // Apply sorting
        switch (sortBy) {
            case "date-asc":
                result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case "date-desc":
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case "total-asc":
                result.sort((a, b) => calculateTotal(a) - calculateTotal(b));
                break;
            case "total-desc":
                result.sort((a, b) => calculateTotal(b) - calculateTotal(a));
                break;
            default:
                break;
        }

        setFilteredOrders(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [orders, statusFilter, searchTerm, sortBy]);

    const calculateTotal = (order) => {
        const subtotal = order.products.reduce((total, item) => total + item.price * item.quantity, 0);
        return subtotal + 5.99; // Adding shipping cost
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return <Badge status="warning" text="Pending" />;
            case "processing":
                return <Badge status="processing" color="green" text="Processing" />;
            case "shipped":
                return <Badge status="default" color="green" text="Shipped" />;
            case "delivered":
                return <Badge status="success" text="Delivered" />;
            default:
                return <Badge status="default" text={status} />;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "pending":
                return <ClockCircleOutlined style={{ color: "orange" }} />;
            case "processing":
                return <CheckCircleOutlined style={{ color: "green" }} />;
            case "shipped":
                return <CarOutlined style={{ color: "green" }} />;
            case "delivered":
                return <HomeOutlined style={{ color: "green" }} />;
            default:
                return <ClockCircleOutlined />;
        }
    };

    // Get current orders for pagination
    const indexOfLastOrder = currentPage * pageSize;
    const indexOfFirstOrder = indexOfLastOrder - pageSize;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const handlePageChange = (page, pageSize) => {
        setCurrentPage(page);
    };

    const handleShowSizeChange = (current, size) => {
        setPageSize(size);
        setCurrentPage(1);
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Loading your orders..." />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Your Orders</h1>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <Input
                        placeholder="Search orders..."
                        prefix={<SearchOutlined />}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64"
                    />
                    <div className="flex gap-2">
                        <Select
                            defaultValue="all"
                            style={{ width: 140 }}
                            onChange={setStatusFilter}
                            placeholder="Filter by status"
                            suffixIcon={<FilterOutlined />}
                        >
                            <Option value="all">All Statuses</Option>
                            <Option value="pending">Pending</Option>
                            <Option value="processing">Processing</Option>
                            <Option value="shipped">Shipped</Option>
                            <Option value="delivered">Delivered</Option>
                        </Select>
                        <Select
                            defaultValue="date-desc"
                            style={{ width: 160 }}
                            onChange={setSortBy}
                            placeholder="Sort by"
                            suffixIcon={<SortAscendingOutlined />}
                        >
                            <Option value="date-desc">Newest First</Option>
                            <Option value="date-asc">Oldest First</Option>
                            <Option value="total-desc">Highest Total</Option>
                            <Option value="total-asc">Lowest Total</Option>
                        </Select>
                    </div>
                </div>
            </div>

            <Tabs defaultActiveKey="all" className="mb-6">
                <TabPane tab="All Orders" key="all" />
                <TabPane tab="Pending" key="pending" />
                <TabPane tab="Processing" key="processing" />
                <TabPane tab="Shipped" key="shipped" />
                <TabPane tab="Delivered" key="delivered" />
            </Tabs>

            <div className="mb-4">
                <p className="text-gray-600">
                    Showing {filteredOrders.length > 0 ? indexOfFirstOrder + 1 : 0}-
                    {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
                </p>
            </div>

            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {currentOrders.map((order) => (
                        <Card
                            key={order._id}
                            className="hover:shadow-md transition-shadow border border-gray-200"
                            bodyStyle={{ padding: "16px" }}
                        >
                            <div className="flex flex-col md:flex-row justify-between">
                                <div className="mb-4 md:mb-0">
                                    <div className="flex items-center mb-2">
                                        {getStatusIcon(order.status)}
                                        <h2 className="text-lg font-semibold text-gray-800 ml-2">Order #{order._id}</h2>
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                        {new Date(order.createdAt).toLocaleTimeString()}
                                    </p>
                                    <div className="mb-2">{getStatusBadge(order.status)}</div>
                                    <p className="text-gray-800 font-semibold">Total: ${calculateTotal(order).toFixed(2)}</p>
                                </div>

                                <div className="flex flex-col">
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {order.products.slice(0, 3).map((item) => (
                                            <Tooltip key={item.product._id} title={`${item.product.name} (x${item.quantity})`}>
                                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden">
                                                    {item.product.imageUrl ? (
                                                        <img
                                                            src={item.product.imageUrl || "/placeholder.svg"}
                                                            alt={item.product.name}
                                                            className="w-full h-full object-cover rounded-md"
                                                        />
                                                    ) : (
                                                        <ShoppingOutlined style={{ fontSize: "20px", color: "#666" }} />
                                                    )}
                                                </div>
                                            </Tooltip>
                                        ))}
                                        {order.products.length > 3 && (
                                            <Tooltip title={`${order.products.length - 3} more items`}>
                                                <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-500">
                                                    +{order.products.length - 3}
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                    <GreenButton type="primary" onClick={() => navigate(`/orders/${order._id}`)} className="self-end">
                                        View Details
                                    </GreenButton>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <div className="mt-6 flex justify-center">
                        <Pagination
                            current={currentPage}
                            pageSize={pageSize}
                            total={filteredOrders.length}
                            onChange={handlePageChange}
                            showSizeChanger
                            onShowSizeChange={handleShowSizeChange}
                            pageSizeOptions={["5", "10", "20"]}
                            showTotal={(total) => `Total ${total} orders`}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            searchTerm || statusFilter !== "all"
                                ? "No orders match your filters"
                                : "You haven't placed any orders yet"
                        }
                    />
                    {!(searchTerm || statusFilter !== "all") && (
                        <GreenButton type="primary" size="large" onClick={() => navigate("/")} className="mt-4">
                            Start Shopping
                        </GreenButton>
                    )}
                    {(searchTerm || statusFilter !== "all") && (
                        <GreenButton
                            onClick={() => {
                                setSearchTerm("");
                                setStatusFilter("all");
                            }}
                            className="mt-4"
                        >
                            Clear Filters
                        </GreenButton>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
