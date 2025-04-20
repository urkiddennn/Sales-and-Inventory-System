

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getOrders } from "../../api";
import { message, Spin, Input, Select, Pagination } from "antd";
import { SearchOutlined, ShoppingOutlined } from "@ant-design/icons";
import GreenButton from "./green-button";

const { Option } = Select;

const OrdersPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 5;

    useEffect(() => {
        const fetchOrders = async () => {
            if (authLoading) return;
            if (!isAuthenticated) {
                message.error("Please log in to view orders.");
                navigate("/login");
                return;
            }
            try {
                const token = localStorage.getItem("token");
                const ordersData = await getOrders(token);
                setOrders(ordersData);
                setFilteredOrders(ordersData);
            } catch (error) {
                message.error("Failed to fetch orders");
                if (error.message?.includes("Unauthorized")) navigate("/login");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [navigate, isAuthenticated, authLoading]);

    useEffect(() => {
        let result = [...orders];
        if (statusFilter !== "all") {
            result = result.filter((order) => order.status === statusFilter);
        }
        if (searchTerm) {
            result = result.filter(
                (order) =>
                    order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.products.some((item) => item.product.name.toLowerCase().includes(searchTerm.toLowerCase())),
            );
        }
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setFilteredOrders(result);
        setCurrentPage(1);
    }, [orders, statusFilter, searchTerm]);

    const calculateTotal = (order) => {
        const subtotal = order.products.reduce((total, item) => total + item.price * item.quantity, 0);
        return subtotal + 5.99;
    };

    const currentOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="p-4 max-w-4xl mx-auto min-h-screen">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Your Orders</h1>
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                    placeholder="Search orders..."
                    prefix={<SearchOutlined />}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="sm:w-64"
                />
                <Select
                    defaultValue="all"
                    onChange={setStatusFilter}
                    className="sm:w-32"
                >
                    <Option value="all">All</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="processing">Processing</Option>
                    <Option value="shipped">Shipped</Option>
                    <Option value="delivered">Delivered</Option>
                </Select>
            </div>

            {filteredOrders.length > 0 ? (
                <div className="space-y-4">
                    {currentOrders.map((order) => (
                        <div key={order._id} className="bg-white p-3 rounded-md flex justify-between items-center">
                            <div>
                                <h2 className="text-sm font-medium">Order #{order._id}</h2>
                                <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                                <p className="text-xs capitalize">{order.status}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-medium">${calculateTotal(order).toFixed(2)}</p>
                                <GreenButton type="text" onClick={() => navigate(`/orders/${order._id}`)}>
                                    View
                                </GreenButton>
                            </div>
                        </div>
                    ))}
                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredOrders.length}
                        onChange={setCurrentPage}
                        className="mt-4 text-center"
                    />
                </div>
            ) : (
                <div className="bg-white p-6 rounded-md text-center">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">No Orders Found</h2>
                    <GreenButton type="primary" onClick={() => navigate("/")} className="flex items-center mx-auto">
                        <ShoppingOutlined className="mr-1" /> Start Shopping
                    </GreenButton>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
