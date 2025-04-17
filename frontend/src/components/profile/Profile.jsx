// src/components/profile/Profile.jsx
"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
    Card,
    Avatar,
    Typography,
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
    Upload,
} from "antd";
import {
    UserOutlined,
    EditOutlined,
    LockOutlined,
    LogoutOutlined,
    CalendarOutlined,
    IdcardOutlined,
    HomeOutlined,
    PhoneOutlined,
    UploadOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const Profile = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [passwordMode, setPasswordMode] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        address: "",
        mobileNumber: "",
    });
    const [fileList, setFileList] = useState([]);
    const [passwordData, setPasswordData] = useState({ password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();

    const themeColor = "#15803d"; // green-700

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const userData = await response.json();
                console.log("Fetched user data:", userData); // Debug
                setUser({ ...userData, createdAt: userData.createdAt || new Date() });
                setFormData({
                    name: userData.name || "",
                    email: userData.email || "",
                    address: userData.address || "",
                    mobileNumber: userData.mobileNumber || "",
                });
                form.setFieldsValue({
                    name: userData.name || "",
                    email: userData.email || "",
                    address: userData.address || "",
                    mobileNumber: userData.mobileNumber || "",
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                message.error("Failed to load profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [isAuthenticated, navigate, form]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleEditSubmit = async (values) => {
        setError("");
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const formDataToSend = new FormData();
            formDataToSend.append("name", values.name);
            formDataToSend.append("email", values.email);
            formDataToSend.append("address", values.address);
            formDataToSend.append("mobileNumber", values.mobileNumber);
            if (fileList.length > 0 && fileList[0].originFileObj) {
                console.log("Sending profilePicture:", fileList[0].originFileObj); // Debug
                formDataToSend.append("profilePicture", fileList[0].originFileObj);
            } else {
                console.log("No profilePicture selected"); // Debug
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/users/${user._id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formDataToSend,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Backend error:", errorData); // Debug
                if (errorData.error.includes("Email already in use")) {
                    throw new Error("Email is already in use by another account");
                }
                if (errorData.error.includes("Cloudinary")) {
                    throw new Error("Failed to upload profile picture. Please try again.");
                }
                throw new Error(errorData.error || "Failed to update profile");
            }

            const updatedUser = await response.json();
            console.log("Updated user:", updatedUser); // Debug
            setUser(updatedUser);
            setEditMode(false);
            setFileList([]);
            message.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (values) => {
        setError("");
        setSubmitting(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/users/${user._id}`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ password: values.password }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to change password");
            }

            passwordForm.resetFields();
            setPasswordMode(false);
            message.success("Password changed successfully!");
        } catch (error) {
            console.error("Error changing password:", error);
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const uploadProps = {
        onRemove: () => {
            setFileList([]);
            console.log("Removed file from fileList"); // Debug
        },
        beforeUpload: (file) => {
            console.log("Selected file:", file); // Debug
            const isImage = file.type.startsWith("image/");
            if (!isImage) {
                message.error("You can only upload image files!");
                return false;
            }
            const isLt2M = file.size / 1024 / 1024 < 2;
            if (!isLt2M) {
                message.error("Image must be smaller than 2MB!");
                return false;
            }
            setFileList([file]);
            console.log("Updated fileList:", [file]); // Debug
            return false; // Prevent automatic upload
        },
        onChange: (info) => {
            console.log("Upload onChange:", info); // Debug
            setFileList(info.fileList);
        },
        fileList,
        accept: "image/*",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Alert message="Error" description="Unable to load profile data." type="error" showIcon />
            </div>
        );
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

                <div style={{ padding: "32px" }}>
                    <Row gutter={[32, 24]} align="middle">
                        <Col xs={24} sm={8} style={{ textAlign: "center" }}>
                            <Avatar
                                key={user.profileUrl || "default"} // Force re-render
                                size={96}
                                src={user.profileUrl ? `${user.profileUrl}?t=${Date.now()}` : undefined} // Cache-busting
                                style={{
                                    backgroundColor: user.profileUrl ? "transparent" : themeColor,
                                    fontSize: "42px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {!user.profileUrl && (user.name ? user.name.charAt(0).toUpperCase() : <UserOutlined />)}
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
                                            <HomeOutlined style={{ color: themeColor }} />
                                            <Text strong>Address:</Text>
                                            <Text>{user.address || "No address provided"}</Text>
                                        </Space>
                                        <Space>
                                            <PhoneOutlined style={{ color: themeColor }} />
                                            <Text strong>Mobile:</Text>
                                            <Text>{user.mobileNumber || "No mobile number provided"}</Text>
                                        </Space>
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

                    {editMode && (
                        <>
                            <Title level={4}>Edit Profile</Title>
                            {error && <Alert message={error} type="error" style={{ marginBottom: "16px" }} />}
                            <Form form={form} layout="vertical" initialValues={formData} onFinish={handleEditSubmit}>
                                <Form.Item
                                    name="name"
                                    label="Name"
                                    rules={[{ required: true, message: "Please enter your name" }]}
                                >
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
                                <Form.Item
                                    name="address"
                                    label="Address"
                                    rules={[{ required: true, message: "Please enter your address" }]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item
                                    name="mobileNumber"
                                    label="Mobile Number"
                                    rules={[
                                        { required: true, message: "Please enter your mobile number" },
                                        {
                                            pattern: /^[0-9]{10}$/,
                                            message: "Please enter a valid 10-digit mobile number",
                                        },
                                    ]}
                                >
                                    <Input />
                                </Form.Item>
                                <Form.Item name="profilePicture" label="Profile Picture">
                                    <Upload {...uploadProps}>
                                        <Button icon={<UploadOutlined />}>Upload Profile Picture</Button>
                                    </Upload>
                                    {/* Fallback native input for testing */}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files[0]) {
                                                setFileList([{ originFileObj: e.target.files[0] }]);
                                                console.log("Selected file (native input):", e.target.files[0]);
                                            }
                                        }}
                                        style={{ marginTop: "8px" }}
                                    />
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
                                            loading={submitting}
                                            disabled={submitting}
                                        >
                                            Save Changes
                                        </Button>
                                        <Button onClick={() => setEditMode(false)} disabled={submitting}>
                                            Cancel
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </>
                    )}

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
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error("The two passwords do not match"));
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
                                            loading={submitting}
                                            disabled={submitting}
                                        >
                                            Change Password
                                        </Button>
                                        <Button onClick={() => setPasswordMode(false)} disabled={submitting}>
                                            Cancel
                                        </Button>
                                    </Space>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default Profile;
