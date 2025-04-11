"use client"

import React, { useState, useMemo } from "react" // Import useMemo
// Import Input and Select components
import { Table, Button, Space, Popconfirm, message, Tag, Input, Select } from "antd"
import { EyeOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

// Define status options based on your model's enum
const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const OrderList = () => {
    const navigate = useNavigate()

    // --- State ---
    const [orders, setOrders] = useState([
        // Your existing sample data with 'status' included...
        { id: "1", products: [{ product: { id: "1", name: "Product A" }, quantity: 2, price: 29.99 }, { product: { id: "3", name: "Product C" }, quantity: 1, price: 19.99 },], total: 79.97, user: { id: "2", name: "Jane Smith", email: "jane@example.com" }, status: 'delivered', createdAt: "2023-09-15T10:30:00Z" },
        { id: "2", products: [{ product: { id: "2", name: "Product B" }, quantity: 1, price: 49.99 }], total: 49.99, user: { id: "1", name: "John Doe", email: "john@example.com" }, status: 'shipped', createdAt: "2023-09-14T15:45:00Z" },
        { id: "3", products: [{ product: { id: "4", name: "Product D" }, quantity: 3, price: 39.99 }, { product: { id: "1", name: "Product A" }, quantity: 1, price: 29.99 },], total: 149.96, user: { id: "3", name: "Bob Johnson", email: "bob@example.com" }, status: 'pending', createdAt: "2023-09-13T09:15:00Z" },
        { id: "4", products: [{ product: { id: "5", name: "Product E" }, quantity: 5, price: 9.99 }], total: 49.95, user: { id: "2", name: "Jane Smith", email: "jane@example.com" }, status: 'processing', createdAt: "2023-09-16T11:00:00Z" },
        { id: "5", products: [{ product: { id: "6", name: "Product F" }, quantity: 1, price: 99.99 }], total: 99.99, user: { id: "4", name: "Alice Brown", email: "alice@example.com" }, status: 'cancelled', createdAt: "2023-09-17T14:20:00Z" },
    ]);
    const [searchTerm, setSearchTerm] = useState(''); // State for search input

    // --- Handlers ---
    const deleteOrder = (id) => {
        // In a real app, you'd call an API here first
        setOrders(prevOrders => prevOrders.filter((order) => order.id !== id));
        message.success("Order deleted successfully (locally)");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(); // Adjust formatting as needed
    };

    // Handler to update status in local state
    const handleStatusChange = (orderId, newStatus) => {
        // In a real app, you'd call an API here first to update the backend
        setOrders(prevOrders =>
            prevOrders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
        message.success(`Order ${orderId} status updated to ${newStatus} (locally)`);
    };

    // --- Filtering Logic ---
    // Use useMemo to avoid recalculating on every render unless orders or searchTerm change
    const filteredOrders = useMemo(() => {
        if (!searchTerm) {
            return orders; // No search term, return all orders
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return orders.filter(order =>
            order.id.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.user.name.toLowerCase().includes(lowerCaseSearchTerm) ||
            order.user.email.toLowerCase().includes(lowerCaseSearchTerm)
            // Add more fields to search if needed (e.g., product names)
        );
    }, [orders, searchTerm]); // Dependencies for useMemo

    // --- Column Definitions ---
    const getStatusColor = (status) => { /* ... (same as before) ... */
        switch (status) {
            case 'pending': return 'orange';
            case 'processing': return 'blue';
            case 'shipped': return 'cyan';
            case 'delivered': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const columns = [
        { title: "Order ID", dataIndex: "id", key: "id", width: 100, sorter: (a, b) => a.id.localeCompare(b.id) },
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
            render: (_, record) => ( /* ... (same as before) ... */
                <div>
                    {record.products.map((item, index) => (
                        <div key={index}>
                            {item.quantity} x {item.product.name}
                        </div>
                    ))}
                </div>
            ),
        },
        { title: "Total", dataIndex: "total", key: "total", render: (total) => `$${total.toFixed(2)}`, sorter: (a, b) => a.total - b.total },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            // Use Select for editing status
            render: (status, record) => (
                <Select
                    value={status}
                    style={{ width: 120 }}
                    onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
                    onClick={(e) => e.stopPropagation()} // Prevent row click triggers if any
                >
                    {STATUS_OPTIONS.map(option => (
                        <Select.Option key={option} value={option}>
                            <Tag color={getStatusColor(option)} style={{ marginRight: 0 }}> {/* Show tag inside option for consistency */}
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Tag>
                        </Select.Option>
                    ))}
                </Select>
            ),
            // Optional: Add filters for status
            filters: STATUS_OPTIONS.map(s => ({ text: s.charAt(0).toUpperCase() + s.slice(1), value: s })),
            onFilter: (value, record) => record.status === value,
        },
        { title: "Date", dataIndex: "createdAt", key: "createdAt", render: (date) => formatDate(date), sorter: (a, b) => new Date(b.createdAt) - new Date(a.createdAt), defaultSortOrder: 'descend' },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="link" icon={<EyeOutlined />} onClick={(e) => { e.stopPropagation(); navigate(`/admin/order/${record.id}`); }}>
                        View
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this order?"
                        onConfirm={(e) => { e.stopPropagation(); deleteOrder(record.id); }}
                        onCancel={(e) => e.stopPropagation()} // Prevent row click if cancel is clicked
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ style: { backgroundColor: "#ef4444" } }}
                    >
                        {/* Stop propagation here too, otherwise clicking delete triggers Popconfirm AND Select change sometimes */}
                        <Button type="link" danger icon={<DeleteOutlined />} onClick={(e) => e.stopPropagation()}>
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // --- Render ---
    return (
        <div>
            <div className="flex justify-between items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold whitespace-nowrap">Orders</h2>
                {/* Search Input */}
                <Input
                    placeholder="Search by Order ID, Customer Name/Email"
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px' }}
                    allowClear // Allow clearing the search
                />
            </div>

            <Table
                columns={columns}
                // Use the filtered data source
                dataSource={filteredOrders}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                scroll={{ x: 900 }} // Adjust scroll width if needed
            />
        </div>
    );
}

export default OrderList;
