"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table, Button, Space, Modal, message } from "antd";
import { useAuth } from "../../components/auth/AuthContext";
import { fetchProducts, deleteProduct } from "../../api";
import Product from "./Product";

const ProductList = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userRole, loading: authLoading } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (!isAuthenticated) {
            message.error("Please log in to view products");
            navigate("/login");
            return;
        }

        if (userRole !== "admin") {
            message.error("You do not have permission to manage products");
            navigate("/");
            return;
        }

        const loadProducts = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                console.log("Fetching products with token:", token);
                const data = await fetchProducts(token);
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
                message.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, [isAuthenticated, userRole, authLoading, navigate]);

    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");
            await deleteProduct(token, id);
            setProducts(products.filter((product) => product._id !== id));
            message.success("Product deleted successfully");
        } catch (error) {
            console.error("Error deleting product:", error);
            message.error("Failed to delete product");
        }
    };

    const handleAddProduct = () => {
        setAddModalVisible(true);
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setEditModalVisible(true);
    };

    const handleAddModalClose = () => {
        setAddModalVisible(false);
    };

    const handleEditModalClose = () => {
        setEditModalVisible(false);
        setSelectedProduct(null);
    };

    const handleProductCreatedOrUpdated = async () => {
        setAddModalVisible(false);
        setEditModalVisible(false);
        setSelectedProduct(null);
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const data = await fetchProducts(token);
            setProducts(data || []);
            message.success("Product saved successfully");
        } catch (error) {
            console.error("Error refreshing products:", error);
            message.error("Failed to refresh products");
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { title: "Name", dataIndex: "name", key: "name" },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            render: (price) => `$${price.toFixed(2)}`,
        },
        { title: "Stock", dataIndex: "stock", key: "stock" },
        { title: "Category", dataIndex: "category", key: "category" },
        {
            title: "On Sale",
            dataIndex: "isOnSale",
            key: "isOnSale",
            render: (isOnSale) => (isOnSale ? "Yes" : "No"),
        },
        {
            title: "Actions",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => handleEditProduct(record)}>
                        Edit
                    </Button>
                    <Button danger onClick={() => handleDelete(record._id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    if (authLoading) {
        return <div>Loading authentication...</div>;
    }

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Product List</h2>
            <Button
                type="primary"
                onClick={handleAddProduct}
                style={{ marginBottom: 16, backgroundColor: "#eab308" }}
            >
                Add New Product
            </Button>
            <Table
                columns={columns}
                dataSource={products}
                rowKey="_id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
            <Modal
                title="Add New Product"
                open={addModalVisible}
                onCancel={handleAddModalClose}
                footer={null}
                destroyOnClose
            >
                <Product onCancel={handleAddModalClose} onSuccess={handleProductCreatedOrUpdated} />
            </Modal>
            <Modal
                title="Edit Product"
                open={editModalVisible}
                onCancel={handleEditModalClose}
                footer={null}
                destroyOnClose
            >
                <Product
                    product={selectedProduct}
                    onCancel={handleEditModalClose}
                    onSuccess={handleProductCreatedOrUpdated}
                />
            </Modal>
        </div>
    );
};

export default ProductList;
