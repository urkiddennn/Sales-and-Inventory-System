"use client"

import { Menu, Layout } from "antd"
import {
    DashboardOutlined,
    ShopOutlined,
    UserOutlined,
    MessageOutlined,
    ShoppingCartOutlined,
    LogoutOutlined,
} from "@ant-design/icons"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../components/auth/AuthContext" // Adjust path based on your structure

const { Sider } = Layout

const Sidebar = ({ collapsed, setCollapsed }) => {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()

    // Get the current path to highlight the active menu item
    const currentPath = location.pathname.split("/")[2] || "dashboard"

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            theme="light" // This makes the sidebar background white
            style={{
                background: "white", // This removes the default background
                boxShadow: "none", // This removes any shadow
            }}
        >
            <div style={{ height: "32px", margin: "16px" }} /> {/* Logo placeholder without background */}
            <Menu
                theme="light"
                mode="inline"
                selectedKeys={[currentPath]}
                style={{
                    background: "transparent", // This removes the menu background
                    border: "none", // This removes the border
                }}
            >
                <Menu.Item key="dashboard" icon={<DashboardOutlined />} onClick={() => navigate("/admin/dashboard")}>
                    Dashboard
                </Menu.Item>
                <Menu.Item key="products" icon={<ShopOutlined />} onClick={() => navigate("/admin/products")}>
                    Products
                </Menu.Item>
                <Menu.Item key="users" icon={<UserOutlined />} onClick={() => navigate("/admin/users")}>
                    Users
                </Menu.Item>
                <Menu.Item key="chats" icon={<MessageOutlined />} onClick={() => navigate("/admin/chats")}>
                    Chats
                </Menu.Item>
                <Menu.Item key="orders" icon={<ShoppingCartOutlined />} onClick={() => navigate("/admin/orders")}>
                    Orders
                </Menu.Item>
                <Menu.Divider style={{ background: "#f0f0f0", margin: "16px 0" }} />
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: "#ff4d4f" }}>
                    Logout
                </Menu.Item>
            </Menu>
        </Sider>
    )
}

export default Sidebar
