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

    const getBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    const onFinish = async (values) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("No authentication token found");

            console.log("Raw form values:", JSON.stringify(values, null, 2));

            // Prepare product data
            const productData = {
                name: values.name,
                description: values.description || "",
                price: values.price,
                stock: values.stock,
                category: values.category || "other",
                isOnSale: values.isOnSale || false,
                salePrice: values.isOnSale && values.salePrice ? values.salePrice : null,
                ratings: values.ratings || 0,
            };

            // Convert image to base64 if a new file is selected
            if (fileList[0]?.originFileObj) {
                console.log("Converting image to base64...");
                const base64Image = await getBase64(fileList[0].originFileObj);
                productData.image = base64Image; // Base64 string
                console.log("Base64 image:", base64Image.substring(0, 50) + "...");
            } else if (fileList[0]?.url) {
                productData.image = fileList[0].url; // Existing URL
            }

            console.log("Product data to send:", JSON.stringify(productData, null, 2));

            // Send to backend
            if (product) {
                console.log("Updating product", product._id);
                await updateProduct(token, product._id, productData);
                message.success("Product updated successfully!");
            } else {
                console.log("Creating new product");
                await createProduct(token, productData);
                message.success("Product created successfully!");
            }

            form.resetFields();
            setFileList([]);
            setIsOnSale(false);
            onSuccess();
        } catch (error) {
            console.error("Error saving product:", error);
            const errorMessage = error.message.includes("required")
                ? "Please ensure name, price, and stock are valid"
                : error.message;
            message.error(`Failed to save product: ${errorMessage}`);
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
        const file = newFileList[0];
        if (file && !file.type.startsWith("image/")) {
            message.error("Please upload an image file (JPEG, PNG)");
            return;
        }
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
                price: null,
                stock: null,
                category: "",
                isOnSale: false,
                salePrice: null,
                ratings: 0,
            }}
        >
            <Form.Item
                name="name"
                label="Product Name"
                rules={[
                    { required: true, message: "Please enter the product name" },
                    { min: 1, message: "Product name cannot be empty" },
                    { whitespace: true, message: "Product name cannot be only whitespace" },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="description"
                label="Description"
                rules={[{ max: 500, message: "Description cannot exceed 500 characters" }]}
            >
                <TextArea rows={4} />
            </Form.Item>
            <Form.Item
                name="price"
                label="Price"
                rules={[
                    { required: true, message: "Please enter the price" },
                    { type: "number", min: 0.01, message: "Price must be greater than 0" },
                ]}
            >
                <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
                name="stock"
                label="Stock"
                rules={[
                    { required: true, message: "Please enter the stock quantity" },
                    { type: "number", min: 0, message: "Stock cannot be negative" },
                ]}
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
            <Form.Item name="isOnSale" label="On Sale" valuePropName="checked">
                <Switch checked={isOnSale} onChange={handleSaleToggle} />
            </Form.Item>
            {isOnSale && (
                <Form.Item
                    name="salePrice"
                    label="Sale Price"
                    rules={[
                        { required: true, message: "Please enter the sale price" },
                        { type: "number", min: 0.01, message: "Sale price must be greater than 0" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || value < getFieldValue("price")) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Sale price must be less than regular price"));
                            },
                        }),
                    ]}
                >
                    <InputNumber min={0.01} step={0.01} style={{ width: "100%" }} />
                </Form.Item>
            )}
            <Form.Item
                name="image"
                label="Product Image"
                rules={[{ required: !product, message: "Please upload a product image" }]}
            >
                <Upload
                    listType="picture"
                    fileList={fileList}
                    onChange={handleUploadChange}
                    beforeUpload={() => false}
                    accept="image/jpeg,image/png"
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
