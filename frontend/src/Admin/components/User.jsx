// src/components/User.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, Space, Select, message } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { fetchUserById, createUser, updateUser } from "../../api";

const { Option } = Select;

const User = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const isNewUser = id === "new";

    // Assume token is stored in localStorage
    const token = localStorage.getItem("token"); // Adjust based on your auth setup

    useEffect(() => {
        if (!isNewUser && token) {
            const loadUser = async () => {
                setLoading(true);
                try {
                    const user = await fetchUserById(token, id);
                    form.setFieldsValue({
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        address: user.address,
                        mobileNumber: user.mobileNumber,
                    });
                } catch (error) {
                    message.error("Failed to fetch user data");
                    navigate("/admin/users");
                } finally {
                    setLoading(false);
                }
            };
            loadUser();
        }
    }, [id, form, isNewUser, token, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (isNewUser) {
                await createUser(token, {
                    ...values,
                    address: values.address || "", // Provide default if not required
                    mobileNumber: values.mobileNumber || "",
                });
                message.success("User created successfully");
            } else {
                await updateUser(token, id, values);
                message.success("User updated successfully");
            }
            navigate("/admin/users");
        } catch (error) {
            message.error(error.message || `Failed to ${isNewUser ? "create" : "update"} user`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">
                {isNewUser ? "Add New User" : `Edit User #${id.slice(0, 8)}`}
            </h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    name: "",
                    email: "",
                    role: "user",
                    address: "",
                    mobileNumber: "",
                }}
                className="max-w-md"
            >
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: "Please enter user name" }]}
                >
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

                <Form.Item
                    name="address"
                    label="Address"
                    rules={[{ required: true, message: "Please enter address" }]}
                >
                    <Input placeholder="Address" />
                </Form.Item>

                <Form.Item
                    name="mobileNumber"
                    label="Mobile Number"
                    rules={[{ required: true, message: "Please enter mobile number" }]}
                >
                    <Input placeholder="Mobile Number" />
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

                <Form.Item
                    name="role"
                    label="Role"
                    rules={[{ required: true, message: "Please select a role" }]}
                >
                    <Select>
                        <Option value="user">User</Option>
                        <Option value="admin">Admin</Option>
                    </Select>
                </Form.Item>

                <Form.Item>
                    <Space>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            style={{ backgroundColor: "#eab308" }}
                        >
                            {isNewUser ? "Create User" : "Update User"}
                        </Button>
                        <Button onClick={() => navigate("/admin/users")} disabled={loading}>
                            Cancel
                        </Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default User;
