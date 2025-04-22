

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Descriptions, Table, Button, Tag, message } from "antd";
import { ArrowLeftOutlined, PrinterOutlined } from "@ant-design/icons";
import { fetchOrderById } from "../../api";

const Order = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            message.error("Please log in to view order details");
            navigate("/login");
            return;
        }

        const fetchOrder = async () => {
            setLoading(true);
            try {
                const fetchedOrder = await fetchOrderById(token, id);
                console.log("Fetched order:", fetchedOrder);
                setOrder(fetchedOrder);
            } catch (error) {
                console.error("Failed to fetch order:", error);
                message.error(error.message || "Failed to fetch order details");
                navigate("/admin/orders");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id, token, navigate]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const handlePrintInvoice = () => {
        if (!order) {
            message.error("No order data available to print");
            return;
        }

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            message.error("Failed to open print window. Please allow pop-ups.");
            return;
        }

        const invoiceHtml = `
    < html >
        <head>
          <title>Invoice - Order #${order._id?.slice(0, 8) || "Unknown"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .customer-info, .order-info {
              margin-bottom: 20px;
            }
            .customer-info p, .order-info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f4f4f4;
            }
            .total {
              font-weight: bold;
              text-align: right;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="header">
              <h1>Invoice</h1>
              <p>Order #${order._id?.slice(0, 8) || "Unknown"}</p>
            </div>
            <div class="customer-info">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${order.user?.name || "Unknown"}</p>
              <p><strong>Email:</strong> ${order.user?.email || "Not provided"}</p>
              <p><strong>Address:</strong> ${order.user?.address || "Not provided"}</p>
              <p><strong>Mobile Number:</strong> ${order.user?.mobileNumber || "Not provided"
            }</p>
            </div>
            <div class="order-info">
              <h3>Order Information</h3>
              <p><strong>Order ID:</strong> ${order._id || "Unknown"}</p>
              <p><strong>Date:</strong> ${order.createdAt ? formatDate(order.createdAt) : "Unknown"
            }</p>
              <p><strong>Status:</strong> ${order.status || "Unknown"}</p>
            </div>
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.products?.length > 0
                ? order.products
                    .filter((p) => p && p.product)
                    .map(
                        (item) => `
                          <tr>
                            <td>${item.product?.name || "Unknown"}</td>
                            <td>${item.price ? `$${item.price.toFixed(2)}` : "$0.00"
                            }</td>
                            <td>${item.quantity || 0}</td>
                            <td>${item.price && item.quantity
                                ? `$${(item.price * item.quantity).toFixed(2)}`
                                : "$0.00"
                            }</td>
                          </tr>
                        `
                    )
                    .join("")
                : '<tr><td colspan="4">No items found</td></tr>'
            }
              </tbody>
            </table>
            <p class="total">Total: $${order.total?.toFixed(2) || "0.00"
            }</p>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html >
    `;

        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
    };

    const columns = [
        {
            title: "Product",
            dataIndex: "product",
            key: "product",
            render: (product) => product?.name || "Unknown",
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => (price ? `$${price.toFixed(2)} ` : "$0.00"),
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
            render: (quantity) => quantity || 0,
        },
        {
            title: "Subtotal",
            key: "subtotal",
            render: (_, record) =>
                `$${record.price && record.quantity
                    ? (record.price * record.quantity).toFixed(2)
                    : "0.00"
                } `,
        },
    ];

    if (loading) {
        return <div>Loading order details...</div>;
    }

    if (!order) {
        return <div>Order not found</div>;
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
                    <h2 className="text-xl font-semibold m-0">
                        Order #{order._id?.slice(0, 8) || "Unknown"}
                    </h2>
                </div>
                <Button icon={<PrinterOutlined />} onClick={handlePrintInvoice}>
                    Print Invoice
                </Button>
            </div>

            <Card className="mb-4">
                <Descriptions title="Order Information" bordered>
                    <Descriptions.Item label="Order ID">
                        {order._id || "Unknown"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer">
                        {order.user?.name || "Unknown"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        {order.user?.email || "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Address">
                        {order.user?.address || "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Mobile Number">
                        {order.user?.mobileNumber || "Not provided"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Date">
                        {order.createdAt ? formatDate(order.createdAt) : "Unknown"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Tag color={order.status === "cancelled" ? "red" : "green"}>
                            {order.status || "Unknown"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Total">
                        ${order.total?.toFixed(2) || "0.00"}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            <Card title="Order Items">
                <Table
                    columns={columns}
                    dataSource={order.products?.filter((p) => p && p.product) || []}
                    rowKey={(record) =>
                        `${record.product?._id || "unknown"} -${record.quantity || 0} `
                    }
                    pagination={false}
                    summary={() => (
                        <Table.Summary>
                            <Table.Summary.Row>
                                <Table.Summary.Cell
                                    index={0}
                                    colSpan={3}
                                    className="text-right font-bold"
                                >
                                    Total:
                                </Table.Summary.Cell>
                                <Table.Summary.Cell index={1} className="font-bold">
                                    ${order.total?.toFixed(2) || "0.00"}
                                </Table.Summary.Cell>
                            </Table.Summary.Row>
                        </Table.Summary>
                    )}
                />
            </Card>
        </div>
    );
};

export default Order;
