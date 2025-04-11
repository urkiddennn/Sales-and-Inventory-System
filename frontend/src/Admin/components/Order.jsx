"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Card, Descriptions, Table, Button, Tag } from "antd"
import { ArrowLeftOutlined, PrinterOutlined } from "@ant-design/icons"

const Order = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate fetching order data
        // In a real app, you would fetch from an API
        setTimeout(() => {
            setOrder({
                id,
                products: [
                    { id: "1", product: { id: "1", name: "Product A" }, quantity: 2, price: 29.99 },
                    { id: "2", product: { id: "3", name: "Product C" }, quantity: 1, price: 19.99 },
                ],
                total: 79.97,
                user: { id: "2", name: "Jane Smith", email: "jane@example.com" },
                createdAt: "2023-09-15T10:30:00Z",
                status: "Completed",
            })
            setLoading(false)
        }, 500)
    }, [id])

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    const columns = [
        {
            title: "Product",
            dataIndex: "product",
            key: "product",
            render: (product) => product.name,
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price.toFixed(2)}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Subtotal",
            key: "subtotal",
            render: (_, record) => `$${(record.price * record.quantity).toFixed(2)}`,
        },
    ]

    if (loading) {
        return <div>Loading order details...</div>
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate("/admin/orders")}
                        className="mr-2 p-0"
                    />
                    <h2 className="text-xl font-semibold m-0">Order #{id}</h2>
                </div>
                <Button icon={<PrinterOutlined />}>Print Invoice</Button>
            </div>

            <Card className="mb-4">
                <Descriptions title="Order Information" bordered>
                    <Descriptions.Item label="Order ID">{order.id}</Descriptions.Item>
                    <Descriptions.Item label="Customer">{order.user.name}</Descriptions.Item>
                    <Descriptions.Item label="Email">{order.user.email}</Descriptions.Item>
                    <Descriptions.Item label="Date">{formatDate(order.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color="green">{order.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">${order.total.toFixed(2)}</Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Order Items">
                <Table
                    columns={columns}
                    dataSource={order.products}
                    rowKey="id"
                    pagination={false}
                    summary={() => (
                        <Table.Summary>
                            <Table.Summary.Row>
                                <Table.Summary.Cell index={0} colSpan={3} className="text-right font-bold">
                                    Total:
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} className="font-bold">
                                    ${order.total.toFixed(2)}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </div>
    )
}

export default Order
