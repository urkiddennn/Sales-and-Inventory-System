
import { useState, useEffect } from "react";
import { Row, Col, Card, Statistic, Table, Spin, message } from "antd";
import {
    UserOutlined,
    ShoppingOutlined,
    CommentOutlined,
    DollarOutlined,
} from "@ant-design/icons";
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
    getSales,
    fetchProducts,
    fetchUsers,
    getOrders,
    getChats,
} from "../../api"; // Adjust the import path based on your project structure

// Register Chart.js components
ChartJS.register(
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

const AdminDashboard = () => {
    // State for dashboard data
    const [salesData, setSalesData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [topProductsData, setTopProductsData] = useState([]);
    const [userRegistrationData, setUserRegistrationData] = useState([]);
    const [recentOrdersData, setRecentOrdersData] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        activeChats: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Get token from localStorage
    const token = localStorage.getItem("token");

    // Fetch data when component mounts
    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!token) {
                message.error("Please log in to access the dashboard");
                setError("Authentication required");
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch Sales
                let salesResponse;
                try {
                    salesResponse = await getSales(token);
                    console.log("Sales response:", salesResponse);
                } catch (err) {
                    console.error("Failed to fetch sales:", err);
                    throw new Error(`Sales API error: ${err.message}`);
                }
                // Aggregate sales by month
                const salesByMonth = salesResponse.reduce((acc, sale) => {
                    if (!sale || !sale.createdAt || !sale.total) return acc; // Skip invalid sales
                    const date = new Date(sale.createdAt);
                    const month = date.toLocaleString("en-US", { month: "short" });
                    acc[month] = (acc[month] || 0) + sale.total;
                    return acc;
                }, {});
                const formattedSales = Object.entries(salesByMonth)
                    .map(([name, sales]) => ({ name, sales }))
                    .sort(
                        (a, b) =>
                            new Date(`2023-${a.name}-01`) - new Date(`2023-${b.name}-01`)
                    );
                setSalesData(formattedSales);

                // Fetch Products
                let productsResponse;
                try {
                    productsResponse = await fetchProducts();
                    console.log("Products response:", productsResponse);
                } catch (err) {
                    console.error("Failed to fetch products:", err);
                    throw new Error(`Products API error: ${err.message}`);
                }
                setStats((prev) => ({ ...prev, totalProducts: productsResponse.length }));

                // Calculate Category Data
                const categoryCounts = productsResponse.reduce((acc, product) => {
                    if (!product) return acc; // Skip invalid products
                    const category = product.category || "Uncategorized";
                    acc[category] = (acc[category] || 0) + 1;
                    return acc;
                }, {});
                const totalProducts = productsResponse.length;
                const formattedCategories = Object.entries(categoryCounts).map(
                    ([name, value]) => ({
                        name,
                        value: totalProducts ? (value / totalProducts) * 100 : 0,
                    })
                );
                setCategoryData(formattedCategories);

                // Top Selling Products
                const productSales = salesResponse.reduce((acc, sale) => {
                    if (!sale || !sale.products) return acc; // Skip invalid sales
                    sale.products.forEach(({ product, quantity }) => {
                        if (!product || !product._id) return; // Skip invalid products
                        const productId = product._id.toString();
                        acc[productId] = (acc[productId] || 0) + (quantity || 0);
                    });
                    return acc;
                }, {});
                const topProducts = productsResponse
                    .filter((product) => product && product._id) // Ensure product is valid
                    .map((product) => ({
                        name: product.name || "Unknown",
                        sales: productSales[product._id.toString()] || 0,
                    }))
                    .sort((a, b) => b.sales - a.sales)
                    .slice(0, 5);
                setTopProductsData(topProducts);

                // Fetch Users
                let usersResponse;
                try {
                    usersResponse = await fetchUsers(token);
                    console.log("Users response:", usersResponse);
                } catch (err) {
                    console.error("Failed to fetch users:", err);
                    throw new Error(`Users API error: ${err.message}`);
                }
                setStats((prev) => ({ ...prev, totalUsers: usersResponse.length }));

                // User Registration Trend
                const registrationTrend = usersResponse.reduce((acc, user) => {
                    if (!user || !user.createdAt) return acc; // Skip invalid users
                    const date = new Date(user.createdAt);
                    const week = `Week ${Math.ceil(date.getDate() / 7)}`;
                    acc[week] = (acc[week] || 0) + 1;
                    return acc;
                }, {});
                const formattedRegistrations = Object.entries(registrationTrend).map(
                    ([name, users]) => ({
                        name,
                        users,
                    })
                );
                setUserRegistrationData(formattedRegistrations);

                // Fetch Orders
                let ordersResponse;
                try {
                    ordersResponse = await getOrders(token);
                    console.log("Orders response:", ordersResponse);
                } catch (err) {
                    console.error("Failed to fetch orders:", err);
                    throw new Error(`Orders API error: ${err.message}`);
                }
                const formattedOrders = ordersResponse
                    .filter((order) => order && order._id) // Ensure order is valid
                    .slice(0, 4)
                    .map((order) => ({
                        id: order._id.toString(),
                        customer: order.user?.name || "Unknown",
                        date: order.createdAt
                            ? new Date(order.createdAt).toISOString().split("T")[0]
                            : "Unknown",
                        total: order.total || 0,
                        status:
                            order.status && order.status.length > 0
                                ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                                : "Unknown",
                    }));
                setRecentOrdersData(formattedOrders);
                setStats((prev) => ({ ...prev, totalOrders: ordersResponse.length }));

                // Fetch Chats
                let chatsResponse;
                try {
                    chatsResponse = await getChats(token);
                    console.log("Chats response:", chatsResponse);
                } catch (err) {
                    console.error("Failed to fetch chats:", err);
                    throw new Error(`Chats API error: ${err.message}`);
                }
                const uniqueChats = new Set(
                    chatsResponse
                        .filter((chat) => chat && chat.senderId) // Ensure chat is valid
                        .map((chat) =>
                            [
                                chat.senderId.toString(),
                                chat.receiverId?.toString() || "admin",
                            ]
                                .sort()
                                .join("-")
                        )
                );
                setStats((prev) => ({ ...prev, activeChats: uniqueChats.size }));
            } catch (err) {
                setError(err.message);
                message.error(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    // Order Table Columns
    const orderColumns = [
        { title: "Order ID", dataIndex: "id", key: "id" },
        { title: "Customer", dataIndex: "customer", key: "customer" },
        { title: "Date", dataIndex: "date", key: "date" },
        {
            title: "Total",
            dataIndex: "total",
            key: "total",
            render: (total) => `$${total.toFixed(2)}`,
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue";
                if (status === "Delivered") color = "green";
                if (status === "Processing") color = "gold";
                if (status === "Cancelled") color = "red";
                return <span style={{ color }}>{status}</span>;
            },
        },
    ];

    // Colors for charts
    const COLORS = ["#15803d", "#eab308", "#3b82f6", "#ef4444", "#8b5cf6"];

    // Chart.js data and options
    const salesChartData = {
        labels: salesData.map((item) => item.name),
        datasets: [
            {
                label: "Sales ($)",
                data: salesData.map((item) => item.sales),
                backgroundColor: "rgba(21, 128, 61, 0.2)", // #15803d with opacity
                borderColor: "#15803d",
                fill: true,
                tension: 0.4, // Smooth curves
            },
        ],
    };

    const salesChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: (context) => `$${context.parsed.y.toFixed(2)}`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { borderDash: [3, 3] } },
        },
    };

    const categoryChartData = {
        labels: categoryData.map((item) => item.name),
        datasets: [
            {
                data: categoryData.map((item) => item.value),
                backgroundColor: COLORS,
            },
        ],
    };

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "right" },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.label}: ${context.parsed.toFixed(1)}%`,
                },
            },
        },
    };

    const topProductsChartData = {
        labels: topProductsData.map((item) => item.name),
        datasets: [
            {
                label: "Sales (Units)",
                data: topProductsData.map((item) => item.sales),
                backgroundColor: "#eab308",
            },
        ],
    };

    const topProductsChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} units`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { borderDash: [3, 3] } },
        },
    };

    const userRegistrationChartData = {
        labels: userRegistrationData.map((item) => item.name),
        datasets: [
            {
                label: "New Registrations",
                data: userRegistrationData.map((item) => item.users),
                borderColor: "#3b82f6",
                backgroundColor: "#3b82f6",
                fill: false,
                tension: 0.4,
            },
        ],
    };

    const userRegistrationChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: (context) => `${context.parsed.y} users`,
                },
            },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { borderDash: [3, 3] } },
        },
    };

    // Render loading or error state
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center">{error}</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Dashboard</h2>

            {/* Stats Cards */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Products"
                            value={stats.totalProducts}
                            prefix={<ShoppingOutlined />}
                            valueStyle={{ color: "#15803d" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Users"
                            value={stats.totalUsers}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: "#eab308" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Orders"
                            value={stats.totalOrders}
                            prefix={<DollarOutlined />}
                            valueStyle={{ color: "#3b82f6" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Active Chats"
                            value={stats.activeChats}
                            prefix={<CommentOutlined />}
                            valueStyle={{ color: "#10b981" }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Sales Chart */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={16}>
                    <Card title="Sales Overview">
                        <div style={{ height: 300 }}>
                            <Line
                                data={salesChartData}
                                options={salesChartOptions}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Product Categories">
                        <div style={{ height: 300 }}>
                            <Pie
                                data={categoryChartData}
                                options={categoryChartOptions}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Top Products and User Registration */}
            <Row gutter={[16, 16]} className="mt-6">
                <Col xs={24} lg={12}>
                    <Card title="Top Selling Products">
                        <div style={{ height: 300 }}>
                            <Bar
                                data={topProductsChartData}
                                options={topProductsChartOptions}
                            />
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="User Registration Trend">
                        <div style={{ height: 300 }}>
                            <Line
                                data={userRegistrationChartData}
                                options={userRegistrationChartOptions}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Recent Orders */}
            <div className="mt-6">
                <Card title="Recent Orders">
                    <Table
                        columns={orderColumns}
                        dataSource={recentOrdersData}
                        rowKey="id"
                        pagination={false}
                    />
                </Card>
            </div>

            {/* Recent Activity (Placeholder) */}
            <div className="mt-6">
                <Card title="Recent Activity">
                    <ul className="space-y-2">
                        <li className="p-2 border-b">New order received - $129.99</li>
                        <li className="p-2 border-b">
                            Product "Wireless Headphones" updated - Stock: 25
                        </li>
                        <li className="p-2 border-b">
                            New user registered: john.doe@example.com
                        </li>
                        <li className="p-2 border-b">
                            Product "Smart Watch" is now on sale - 15% off
                        </li>
                        <li className="p-2">New chat message from customer Jane Smith</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
