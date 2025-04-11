"use client"

import { useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Form, Input, Button, Space, Select, message } from "antd"
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons"

const { Option } = Select

const User = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const isNewUser = id === "new"

    useEffect(() => {
        if (!isNewUser) {
            // Simulate fetching user data
            // In a real app, you would fetch from an API
            form.setFieldsValue({
                name: "John Doe",
                email: "john@example.com",
                role: "user",
            })
        }
    }, [id, form, isNewUser])

    const onFinish = (values) => {
        console.log("Form values:", values)
        message.success(`User ${isNewUser ? "created" : "updated"} successfully`)
        navigate("/admin/users")
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">{isNewUser ? "Add New User" : `Edit User #${id}`}</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    name: "",
                    email: "",
                    role: "user",
                }}
                className="max-w-md"
            >
                <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter user name" }]}>
                    <Input prefix={<UserOutlined />} placeholder="Full Name" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Please enter email" },
                        { type: "email", message: "Please enter a valid email" },
                    ]}
                >
                    <Input prefix={<MailOutlined />} placeholder="Email" />
                </Form.Item>

                {isNewUser && (
                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: "Please enter password" },
                            { min: 6, message: "Password must be at least 6 characters" },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                )}

                <Form.Item name="role" label="Role" rules={[{ required: true, message: "Please select a role" }]}>
                    <Select>
                        <Option value="user">User</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button type="primary" htmlType="submit" style={{ backgroundColor: "#eab308" }}>
                            {isNewUser ? "Create User" : "Update User"}
                        </Button>
                        <Button onClick={() => navigate("/admin/users")}>Cancel</Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    )
}

export default User
