// src/components/UserList.jsx
"use client";

import { useState, useEffect } from "react";
import { Table, Button, Tag, Switch, message } from "antd";
import { EditOutlined, UserAddOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { fetchUsers, updateUserStatus, deleteUser } from "../../api/";

const UserList = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Assume token is stored in localStorage or context
    const token = localStorage.getItem("token"); // Adjust based on your auth setup

    // Fetch users on component mount
    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            try {
                const fetchedUsers = await fetchUsers(token);
                // Map API response to match frontend expectations
                const formattedUsers = fetchedUsers.map((user) => ({
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    active: user.active !== undefined ? user.active : true, // Default to true if not provided
                }));
                setUsers(formattedUsers);
            } catch (error) {
                console.error("Failed to load users:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadUsers();
        } else {
            message.error("Please log in to view users");
            navigate("/login");
        }
    }, [token, navigate]);

    // Toggle user status
    const toggleStatus = async (id) => {
        try {
            const user = users.find((u) => u.id === id);
            const newStatus = !user.active;
            await updateUserStatus(token, id, newStatus);
            setUsers(
                users.map((u) =>
                    u.id === id ? { ...u, active: newStatus } : u
                )
            );
            message.success("User status updated");
        } catch (error) {
            console.error("Failed to update user status:", error);
        }
    };

    // Delete user
    const handleDelete = async (id) => {
        try {
            await deleteUser(token, id);
            setUsers(users.filter((u) => u.id !== id));
            message.success("User deleted successfully");
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
            render: (id) => id.slice(0, 8), // Shorten MongoDB ObjectId for display
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "Role",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const color = role === "admin" ? "green" : "blue";
                return <Tag color={color}>{role}</Tag>;
            },
        },
        {
            title: "Status",
            dataIndex: "active",
            key: "active",
            render: (active, record) => (
                <Switch
                    checked={active}
                    onChange={() => toggleStatus(record.id)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                />
            ),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <div>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => navigate(`/admin/user/${record.id}`)}
                    >
                        Edit
                    </Button>
                    <Button
                        type="link"
                        danger
                        onClick={() => handleDelete(record.id)}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Users</h2>
                <Button
                    type="primary"
                    icon={<UserAddOutlined />}
                    onClick={() => navigate("/admin/user/new")}
                    style={{ backgroundColor: "#15803d" }}
                >
                    Add User
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                loading={loading}
            />
        </div>
    );
};

export default UserList;
