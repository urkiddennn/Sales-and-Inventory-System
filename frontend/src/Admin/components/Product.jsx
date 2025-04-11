"use client";

import { useEffect, useState } from "react";
import { Form, Input, InputNumber, Select, Button, Space, message, Switch, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../components/auth/AuthContext";
import { createProduct, updateProduct } from "../../api";

const { Option } = Select;
const { TextArea } = Input;

const Product = ({ product, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const { isAuthenticated, userRole, loading: authLoading } = useAuth();
    const [isOnSale, setIsOnSale] = useState(product ? product.isOnSale : false);
    const [fileList, setFileList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("Product useEffect triggered", { isAuthenticated, userRole, authLoading, product });

        if (authLoading) {
            console.log("Auth state not yet resolved, waiting...");
            return;
        }

        setIsLoading(false);

        if (!isAuthenticated) {
            console.log("Not authenticated, closing modal");
            message.error("Please log in to manage products");
            onCancel();
            return;
        }

        if (userRole !== "admin") {
            console.log("Not an admin, closing modal");
            message.error("You do not have permission to manage products");
            onCancel();
            return;
        }

        if (product) {
            form.setFieldsValue({
                name: product.name,
                description: product.description || "",
                price: product.price,
                stock: product.stock,
                category: product.category,
                isOnSale: product.isOnSale,
                salePrice: product.isOnSale ? product.salePrice : null,
                ratings: product.ratings || 0,
            });
            setIsOnSale(product.isOnSale);
            if (product.imageUrl) {
                setFileList([
                    {
                        uid: "-1",
                        name: "existing-image",
                        status: "done",
                        url: product.imageUrl,
                    },
                ]);
            }
        }

        console.log("Proceeding with Product form in modal");
    }, [isAuthenticated, userRole, authLoading, product, form, onCancel]);

    const onFinish = async (values) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            console.log("Form values:", values);
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key !== "image" && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (fileList.length > 0 && fileList[0]?.originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }

            for (let [key, value] of formData.entries()) {
                console.log("FormData:", key, value);
            }

            if (product) {
                console.log("Updating product", product._id);
                await updateProduct(token, product._id, formData);
                message.success("Product updated successfully");
            } else {
                console.log("Creating new product");
                await createProduct(token, formData);
                message.success("Product created successfully");
            }

            form.resetFields();
            setFileList([]);
            setIsOnSale(false);
            onSuccess();
        } catch (error) {
            console.error("Error saving product:", error);
            message.error(`Failed to save product: ${error.message}`);
        }
    };

    const handleSaleToggle = (checked) => {
        setIsOnSale(checked);
        if (!checked) {
            form.setFieldsValue({ salePrice: null });
        } else if (form.getFieldValue("price")) {
            form.setFieldsValue({ salePrice: form.getFieldValue("price") * 0.9 });
        }
    };

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList.slice(-1));
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                name: "",
                description: "",
                price: 0,
                stock: 0,
                category: "",
                isOnSale: false,
                salePrice: null,
                ratings: 0,
            }}
        >
            <Form.Item
                name="name"
                label="Product Name"
                rules={[{ required: true, message: "Please enter the product name" }]}
            >
                <Input />
            </Form.Item>
            <Form.Item name="description" label="Description">
                <TextArea rows={4} />
            </Form.Item>
            <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter the price" }]}
            >
                <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
                name="stock"
                label="Stock"
                rules={[{ required: true, message: "Please enter the stock quantity" }]}
            >
                <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: "Please select a category" }]}
            >
                <Select>
                    <Option value="electronics">Electronics</Option>
                    <Option value="clothing">Clothing</Option>
                    <Option value="books">Books</Option>
                    <Option value="other">Other</Option>
                </Select>
            </Form.Item>
            <Form.Item name="isOnSale" label="On Sale">
                <Switch checked={isOnSale} onChange={handleSaleToggle} />
            </Form.Item>
            {isOnSale && (
                <Form.Item
                    name="salePrice"
                    label="Sale Price"
                    rules={[{ required: true, message: "Please enter the sale price" }]}
                >
                    <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
                </Form.Item>
            )}
            <Form.Item name="ratings" label="Ratings">
                <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item name="image" label="Product Image">
                <Upload
                    listType="picture"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                >
                    {fileList.length === 0 && (
                        <Button icon={<UploadOutlined />}>Upload Image</Button>
                    )}
                </Upload>
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" htmlType="submit">
                        {product ? "Update Product" : "Create Product"}
                    </Button>
                    <Button onClick={onCancel}>Cancel</Button>
                </Space>
            </Form.Item>
        </Form>
    );
};

export default Product;
