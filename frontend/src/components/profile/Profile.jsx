"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext"
import {
    Card,
    Avatar,
    Typography,
    Tabs,
    Button,
    Form,
    Input,
    Spin,
    Alert,
    Divider,
    Space,
    Row,
    Col,
    message,
} from "antd"
import {
    UserOutlined,
    EditOutlined,
    LockOutlined,
    LogoutOutlined,
    CalendarOutlined,
    IdcardOutlined,
} from "@ant-design/icons"

const { Title, Text } = Typography
const { TabPane } = Tabs

const Profile = () => {
    const { isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [editMode, setEditMode] = useState(false)
    const [passwordMode, setPasswordMode] = useState(false)
    const [formData, setFormData] = useState({ name: "", email: "" })
    const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: "" })
    const [error, setError] = useState("")
    const [form] = Form.useForm()
    const [passwordForm] = Form.useForm()

    // Theme color
    const themeColor = "#15803d" // green-700

    // Fetch user profile data when component mounts
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login")
            return
        }

        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                })

                if (!response.ok) {
                    throw new Error("Failed to fetch profile")
                }

                const userData = await response.json()
                setUser({ ...userData, createdAt: userData.createdAt || new Date() })
                setFormData({ name: userData.name || "", email: userData.email || "" })
                form.setFieldsValue({ name: userData.name || "", email: userData.email || "" })
            } catch (error) {
                console.error("Error fetching profile:", error)
                message.error("Failed to load profile. Please try again.")
            } finally {
                setLoading(false)
            }
        }

        fetchUserProfile()
    }, [isAuthenticated, navigate, form])

    const handleLogout = () => {
        logout()
        navigate("/")
    }

    const handleEditSubmit = async (values) => {
        setError("")
        try {
            const token = localStorage.getItem("token")
            const userId = user._id
            const response = await fetch(`${import.meta.env.REACT_APP_API_UR}/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name: values.name, email: values.email }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to update profile")
            }

            const updatedUser = await response.json()
            setUser(updatedUser)
            setEditMode(false)
            message.success("Profile updated successfully!")
        } catch (error) {
            console.error("Error updating profile:", error)
            setError(error.message)
        }
    }

    const handlePasswordSubmit = async (values) => {
        setError("")
        try {
            const token = localStorage.getItem("token")
            const userId = user._id
            const response = await fetch(`${import.meta.env.REACT_APP_API_UR}/users/${userId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password: values.password }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to change password")
            }

            passwordForm.resetFields()
            setPasswordMode(false)
            message.success("Password changed successfully!")
        } catch (error) {
            console.error("Error changing password:", error)
            setError(error.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Alert message="Error" description="Unable to load profile data." type="error" showIcon />
            </div>
        )
    }

    return (
        <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "24px" }}>
            <Card
                style={{
                    width: "100%",
                    maxWidth: "800px",
                    margin: "0 auto",
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                    border: "1px solid #d9d9d9",
                }}
                bodyStyle={{ padding: 0 }}
            >
                {/* Header */}
                <div
                    style={{
                        background: `linear-gradient(to right, ${themeColor}, #22c55e)`,
                        padding: "24px 32px",
                        color: "white",
                    }}
                >
                    <Title level={2} style={{ color: "white", margin: 0 }}>
                        Your Profile
                    </Title>
                    <Text style={{ color: "rgba(255, 255, 255, 0.85)" }}>Manage your account details and settings here.</Text>
                </div>

                {/* Content */}
                <div style={{ padding: "32px" }}>
                    {/* Profile Picture and Details */}
                    <Row gutter={[32, 24]} align="middle">
                        <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                            <Avatar
                                size={96}
                                style={{
                                    backgroundColor: themeColor,
                                    fontSize: "42px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : <UserOutlined />}
                            </Avatar>
                        </Col>

                        <Col xs={24} sm={16}>
                            {!editMode && !passwordMode && (
                                <>
                                    <Title level={3} style={{ marginTop: 0, marginBottom: "8px" }}>
                                        {user.name || "User"}
                                    </Title>
                                    <Text type="secondary" style={{ fontSize: "16px" }}>
                                        {user.email || "No email provided"}
                                    </Text>

                                    <Space direction="vertical" style={{ marginTop: "16px", width: "100%" }}>
                                        <Space>
                                            <CalendarOutlined style={{ color: themeColor }} />
                                            <Text strong>Joined:</Text>
                                            <Text>{new Date(user.createdAt).toLocaleDateString()}</Text>
                                        </Space>

                                        <Space>
                                            <IdcardOutlined style={{ color: themeColor }} />
                                            <Text strong>Role:</Text>
                                            <Text>{user.role || "user"}</Text>
                                        </Space>
                                    </Space>
                                </>
                            )}
                        </Col>
                    </Row>

                    <Divider style={{ margin: "24px 0" }} />

                    {/* Actions */}
                    {!editMode && !passwordMode && (
                        <Space wrap style={{ marginBottom: "24px" }}>
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => setEditMode(true)}
                                style={{
                                    backgroundColor: themeColor,
                                    borderColor: themeColor,
                                }}
                            >
                                Edit Profile
                            </Button>

                            <Button
                                type="primary"
                                icon={<LockOutlined />}
                                onClick={() => setPasswordMode(true)}
                                style={{
                                    backgroundColor: "#2563eb",
                                    borderColor: "#2563eb",
                                }}
                            >
                                Change Password
                            </Button>

                            <Button danger icon={<LogoutOutlined />} onClick={handleLogout}>
                                Logout
                            </Button>
                        </Space>
                    )}

                    {/* Edit Profile Form */}
                    {editMode && (
                        <>
                            <Title level={4}>Edit Profile</Title>
                            {error && <Alert message={error} type="error" style={{ marginBottom: "16px" }} />}

                            <Form form={form} layout="vertical" initialValues={formData} onFinish={handleEditSubmit}>
                                <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter your name" }]}>
                                    <Input />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Email"
                                    rules={[
                                        { required: true, message: "Please enter your email" },
                                        { type: "email", message: "Please enter a valid email" },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            style={{
                                                backgroundColor: themeColor,
                                                borderColor: themeColor,
                                            }}
                                        >
                                            Save Changes
                                        </Button>

                                        <Button onClick={() => setEditMode(false)}>Cancel</Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </>
                    )}

                    {/* Change Password Form */}
                    {passwordMode && (
                        <>
                            <Title level={4}>Change Password</Title>
                            {error && <Alert message={error} type="error" style={{ marginBottom: "16px" }} />}

                            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordSubmit}>
                                <Form.Item
                                    name="password"
                                    label="New Password"
                                    rules={[
                                        { required: true, message: "Please enter your new password" },
                                        { min: 6, message: "Password must be at least 6 characters" },
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    dependencies={["password"]}
                                    rules={[
                                        { required: true, message: "Please confirm your password" },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue("password") === value) {
                                                    return Promise.resolve()
                                                }
                                                return Promise.reject(new Error("The two passwords do not match"))
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password />
                                </Form.Item>

                                <Form.Item>
                                    <Space>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            style={{
                                                backgroundColor: "#2563eb",
                                                borderColor: "#2563eb",
                                            }}
                                        >
                                            Change Password
                                        </Button>

                                        <Button onClick={() => setPasswordMode(false)}>Cancel</Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Profile
