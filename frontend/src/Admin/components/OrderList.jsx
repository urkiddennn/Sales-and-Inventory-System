    // src/components/OrderList.jsx
    "use client";

    import React, { useState, useMemo, useEffect } from "react";
    import { Table, Button, Space, Popconfirm, message, Tag, Input, Select } from "antd";
    import { EyeOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
    import { useNavigate } from "react-router-dom";
    import { getOrders, updateOrderStatus, deleteOrder } from "../../api";

    const { Option } = Select;

    const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    const OrderList = () => {
        const navigate = useNavigate();
        const [orders, setOrders] = useState([]);
        const [searchTerm, setSearchTerm] = useState('');
        const [loading, setLoading] = useState(false);

        const token = localStorage.getItem("token"); // Adjust based on your auth setup

        // Fetch orders on mount
        useEffect(() => {
            if (!token) {
                message.error("Please log in to view orders");
                navigate("/login");
                return;
            }

            const fetchOrders = async () => {
                setLoading(true);
                try {
                    const fetchedOrders = await getOrders(token);
                    setOrders(fetchedOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrders();
        }, [token, navigate]);

        const handleStatusChange = async (orderId, newStatus) => {
            try {
                const updatedOrder = await updateOrderStatus(token, orderId, { status: newStatus });
                setOrders(prevOrders =>
                    prevOrders.map(order =>
                        order._id === orderId ? { ...order, status: updatedOrder.status } : order
                    )
                );
                message.success(`Order ${orderId} status updated to ${newStatus}`);
            } catch (error) {
                console.error("Failed to update order status:", error);
            }
        };

        const handleDeleteOrder = async (orderId) => {
            try {
                await deleteOrder(token, orderId);
                setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
                message.success("Order deleted successfully");
            } catch (error) {
                console.error("Failed to delete order:", error);
            }
        };

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleString();
        };

        const getStatusColor = (status) => {
            switch (status) {
                case 'pending': return 'orange';
                case 'processing': return 'blue';
                case 'shipped': return 'cyan';
                case 'delivered': return 'green';
                case 'cancelled': return 'red';
                default: return 'default';
            }
        };

        const filteredOrders = useMemo(() => {
            if (!searchTerm) return orders;
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            return orders.filter(order =>
                order._id.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
                order.products.some(item =>
                    item.product.name.toLowerCase().includes(lowerCaseSearchTerm)
                )
            );
        }, [orders, searchTerm]);

        const columns = [
            {
                title: "Order ID",
                dataIndex: "_id",
                key: "_id",
                width: 100,
                render: (id) => id.slice(0, 8),
                sorter: (a, b) => a._id.localeCompare(b._id),
            },
            {
                title: "Customer",
                key: "user",
                render: (_, record) => (
                    <div>
                        <div>{record.user.name}</div>
                        <div className="text-xs text-gray-500">{record.user.email}</div>
                    </div>
                ),
                sorter: (a, b) => a.user.name.localeCompare(b.user.name),
            },
            {
                title: "Products",
                key: "products",
                render: (_, record) => (
                    <div>
                        {record.products.map((item, index) => (
                            <div key={index}>
                                {item.quantity} x {item.product.name}
                            </div>
                        ))}
                    </div>
                ),
            },
            {
                title: "Total",
                dataIndex: "total",
                key: "total",
                render: (total) => `$${total.toFixed(2)}`,
                sorter: (a, b) => a.total - b.total,
            },
            {
                title: "Status",
                dataIndex: "status",
                key: "status",
                render: (status, record) => (
                    <Select
                        value={status}
                        style={{ width: 120 }}
                        onChange={(newStatus) => handleStatusChange(record._id, newStatus)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {STATUS_OPTIONS.map(option => (
                            <Option key={option} value={option}>
                                <Tag color={getStatusColor(option)} style={{ marginRight: 0 }}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </Tag>
                            </Option>
                        ))}
                    </Select>
                ),
                filters: STATUS_OPTIONS.map(s => ({ text: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
                onFilter: (value, record) => record.status === value,
            },
            {
                title: "Date",
                dataIndex: "createdAt",
                key: "createdAt",
                render: (date) => formatDate(date),
                sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                defaultSortOrder: 'descend',
            },
            {
                title: "Actions",
                key: "actions",
                render: (_, record) => (
                    <Space size="middle">
                        <Button
                            type="link"
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/order/${record._id}`);
                            }}
                        >
                            View
                        </Button>
                        <Popconfirm
                            title="Are you sure you want to delete this order?"
                            onConfirm={(e) => {
                                e.stopPropagation();
                                handleDeleteOrder(record._id);
                            }}
                            onCancel={(e) => e.stopPropagation()}
                            okText="Yes"
                            cancelText="No"
                            okButtonProps={{ style: { backgroundColor: "#ef4444" } }}
                        >
                            <Button
                                type="link"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Delete
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ];

        return (
            <div>
                <div className="flex justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-semibold whitespace-nowrap">Orders</h2>
                    <Input
                        placeholder="Search by Order ID, Customer Name/Email, or Product Name"
                        prefix={<SearchOutlined />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', maxWidth: '400px' }}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredOrders}
                    rowKey="_id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 900 }}
                    loading={loading}
                />
            </div>
        );
    };

    export default OrderList;
