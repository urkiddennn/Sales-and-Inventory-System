"use client"

import { useState } from "react"
import { Table, Button, Tag, Switch, message } from "antd"
import { EditOutlined, UserAddOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

const UserList = () => {
    const navigate = useNavigate()

    // Sample user data based on the model
    const [users, setUsers] = useState([
        {
            id: "1",
            email: "john@example.com",
            name: "John Doe",
            role: "admin",
            active: true,
        },
        {
            id: "2",
            email: "jane@example.com",
            name: "Jane Smith",
            role: "user",
            active: true,
        },
        {
            id: "3",
            email: "bob@example.com",
            name: "Bob Johnson",
            role: "user",
            active: false,
        },
        {
            id: "4",
            email: "alice@example.com",
            name: "Alice Brown",
            role: "user",
            active: true,
        },
    ])

    const toggleStatus = (id) => {
        setUsers(
            users.map((user) => {
                if (user.id === id) {
                    return { ...user, active: !user.active }
                }
                return user
            }),
        )
        message.success("User status updated")
    }

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 70,
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
                const color = role === "admin" ? "green" : "blue"
                return <Tag color={color}>{role}</Tag>
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
                <Button type="link" icon={<EditOutlined />} onClick={() => navigate(`/admin/user/${record.id}`)}>
                    Edit
                </Button>
            ),
        },
    ]

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

            <Table columns={columns} dataSource={users} rowKey="id" pagination={{ pageSize: 10 }} />
        </div>
    )
}

export default UserList
