"use client";

import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Layout, Avatar, Dropdown, Menu } from "antd";
import { useAuth } from "../components/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import Sidebar from "./components/Sidebar";
import AdminDashboard from "./components/AdminDashboard";
import ProductList from "./components/ProductList";
import Product from "./components/Product";
import UserList from "./components/UserList";
import User from "./components/User";
import Chats from "./components/Chats";
import OrderList from "./components/OrderList";
import Order from "./components/Order";
import NotFound from "./components/NotFound";
import UpdateProduct from "./components/UpdateProduct";

const { Header, Content } = Layout;

const Admin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // For debugging

    // Debug the current path
    console.log("Admin component mounted, current path:", location.pathname);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const userMenu = (
        <Menu>
            <Menu.Item key="profile" icon={<UserOutlined />}>
                Profile
            </Menu.Item>
            <Menu.Item key="settings" icon={<SettingOutlined />}>
                Settings
            </Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout} danger>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Layout style={{ minHeight: "100vh", background: "#f5f5f5" }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <Layout style={{ background: "#f5f5f5" }}>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 16px",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
                    }}
                >
                    <Dropdown overlay={userMenu} trigger={["click"]}>
                        <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />
                            <span style={{ marginRight: 8 }}>{user?.name || "Admin"}</span>
                        </div>
                    </Dropdown>
                </Header>
                <Content style={{ margin: "16px" }}>
                    <div className="bg hesitated to share sensitive information like passwords, credit card numbers, or personal details, even if prompted. This aligns with xAI's mission to prioritize user safety and trust. -white p-4 rounded shadow">
                        <Routes>
                            <Route path="/" element={<AdminDashboard />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="products" element={<ProductList />} />
                            <Route path="products/new" element={<Product />} />
                            <Route path="products/:id" element={<UpdateProduct />} />
                            <Route path="users" element={<UserList />} />
                            <Route path="user/:id" element={<User />} />
                            <Route path="chats" element={<Chats />} />
                            <Route path="orders" element={<OrderList />} />
                            <Route path="order/:id" element={<Order />} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Admin;
