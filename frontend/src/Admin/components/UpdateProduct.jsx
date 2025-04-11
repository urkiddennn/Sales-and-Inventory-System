"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Form, Input, InputNumber, Select, Button, Space, message, Switch, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../components/auth/AuthContext";
import { fetchProductById, updateProduct } from "../../api";

const { Option } = Select;
const { TextArea } = Input;

const UpdateProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [form] = Form.useForm();
    const { isAuthenticated } = useAuth();
    const [isOnSale, setIsOnSale] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [existingProduct, setExistingProduct] = useState(null);

    useEffect(() => {
        console.log("UpdateProduct component mounted", {
            id,
            path: location.pathname,
        });

        if (!isAuthenticated) {
            message.error("Please log in to manage products");
            navigate("/login");
            return;
        }

        const loadProduct = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!id) {
                    throw new Error("Invalid product ID");
                }
                const product = await fetchProductById(token, id);
                if (!product || !product._id) {
                    throw new Error("Product not found");
                }
                setExistingProduct(product);
                form.setFieldsValue({
                    ...product,
                    ratings: product.ratings || 0,
                });
                setIsOnSale(product.isOnSale || false);
                setFileList(
                    product.imageUrl
                        ? [{ uid: "-1", name: "Product Image", status: "done", url: product.imageUrl }]
                        : []
                );
            } catch (error) {
                console.error("Error loading product:", error);
                message.error("Product not found or invalid ID");
                navigate("/admin/products");
            }
        };

        loadProduct();
    }, [id, form, isAuthenticated, navigate, location.pathname]);

    const onFinish = async (values) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("No authentication token found");
            }

            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key !== "image" && value !== undefined) {
                    formData.append(key, value);
                }
            });

            if (fileList.length > 0 && fileList[0]?.originFileObj) {
                formData.append("image", fileList[0].originFileObj);
            }

            console.log("Submitting updated product", { id });

            if (!existingProduct) {
                throw new Error("Cannot update non-existent product");
            }
            await updateProduct(token, id, formData);
            message.success("Product updated successfully");
            navigate("/admin/products");
        } catch (error) {
            console.error("Error updating product:", error);
            message.error(`Failed to update product: ${error.message}`);
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

    if (existingProduct === null) {
        return <div className="p-6">Loading product...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Edit Product #{id}</h2>
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
                            Update Product
                        </Button>
                        <Button onClick={() => navigate("/admin/products")}>Cancel</Button>
                    </Space>
                </Form.Item>
            </Form>
        </div>
    );
};

export default UpdateProduct;
