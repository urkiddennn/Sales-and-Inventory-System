import { Row, Col, Card, Statistic, Table } from "antd"
import { UserOutlined, ShoppingOutlined, CommentOutlined, DollarOutlined } from "@ant-design/icons"
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts"

const AdminDashboard = () => {
    // Sample data for charts
    const salesData = [
        { name: "Jan", sales: 4000 },
        { name: "Feb", sales: 3000 },
        { name: "Mar", sales: 5000 },
        { name: "Apr", sales: 2780 },
        { name: "May", sales: 1890 },
        { name: "Jun", sales: 2390 },
        { name: "Jul", sales: 3490 },
        { name: "Aug", sales: 4000 },
        { name: "Sep", sales: 5200 },
    ]

    const categoryData = [
        { name: "Electronics", value: 45 },
        { name: "Clothing", value: 25 },
        { name: "Home", value: 15 },
        { name: "Books", value: 10 },
        { name: "Other", value: 5 },
    ]

    const topProductsData = [
        { name: "Product A", sales: 120 },
        { name: "Product B", sales: 98 },
        { name: "Product C", sales: 86 },
        { name: "Product D", sales: 72 },
        { name: "Product E", sales: 65 },
    ]

    const userRegistrationData = [
        { name: "Week 1", users: 20 },
        { name: "Week 2", users: 35 },
        { name: "Week 3", users: 25 },
        { name: "Week 4", users: 40 },
        { name: "Week 5", users: 55 },
        { name: "Week 6", users: 45 },
        { name: "Week 7", users: 60 },
        { name: "Week 8", users: 75 },
    ]

    const recentOrdersData = [
        { id: "1001", customer: "John Doe", date: "2023-09-15", total: 129.99, status: "Completed" },
        { id: "1002", customer: "Jane Smith", date: "2023-09-14", total: 79.99, status: "Processing" },
        { id: "1003", customer: "Bob Johnson", date: "2023-09-13", total: 199.99, status: "Completed" },
        { id: "1004", customer: "Alice Brown", date: "2023-09-12", total: 59.99, status: "Shipped" },
    ]

    const orderColumns = [
        { title: "Order ID", dataIndex: "id", key: "id" },
        { title: "Customer", dataIndex: "customer", key: "customer" },
        { title: "Date", dataIndex: "date", key: "date" },
        { title: "Total", dataIndex: "total", key: "total", render: (total) => `$${total}` },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue"
                if (status === "Completed") color = "green"
                if (status === "Processing") color = "gold"
                return <span style={{ color }}>{status}</span>
            },
        },
    ]

    // Colors for charts
    const COLORS = ["#15803d", "#eab308", "#3b82f6", "#ef4444", "#8b5cf6"]

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Products"
                            value={120}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: "#15803d" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Users" value={840} prefix={<UserOutlined />} valueStyle={{ color: "#eab308" }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Total Orders" value={356} prefix={<DollarOutlined />} valueStyle={{ color: "#3b82f6" }} />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic title="Active Chats" value={28} prefix={<CommentOutlined />} valueStyle={{ color: "#10b981" }} />
                    </Card>
                </Col>
            </Row>

            {/* Sales Chart */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={16}>
                    <Card title="Sales Overview">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={salesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value}`, "Sales"]} />
                                <Area type="monotone" dataKey="sales" stroke="#15803d" fill="#15803d" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Product Categories">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Top Products and User Registration */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Products">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={topProductsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} units`, "Sales"]} />
                                <Bar dataKey="sales" fill="#eab308" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="User Registration Trend">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={userRegistrationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`${value} users`, "New Registrations"]} />
                                <Line type="monotone" dataKey="users" stroke="#3b82f6" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <div className="mt-6">
                <Card title="Recent Orders">
                    <Table columns={orderColumns} dataSource={recentOrdersData} rowKey="id" pagination={false} />
                </Card>
            </div>

            {/* Recent Activity */}
            <div className="mt-6">
                <Card title="Recent Activity">
                    <ul className="space-y-2">
                        <li className="p-2 border-b">New order #1234 received - $129.99</li>
                        <li className="p-2 border-b">Product "Wireless Headphones" updated - Stock: 25</li>
                        <li className="p-2 border-b">New user registered: john.doe@example.com</li>
                        <li className="p-2 border-b">Product "Smart Watch" is now on sale - 15% off</li>
                        <li className="p-2">New chat message from customer Jane Smith</li>
                    </ul>
                </Card>
            </div>
        </div>
    )
}

export default AdminDashboard
