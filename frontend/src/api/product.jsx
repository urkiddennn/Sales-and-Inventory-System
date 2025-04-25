// src/api.js
import { message } from "antd";

const REACT_APP_URI = 'http://localhost:3000/api';

export const fetchProducts = async () => {
    try {
        console.log("Fetching products from:", `${REACT_APP_URI}/products`);
        const response = await fetch(`${REACT_APP_URI}/products`);

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response:", errorData);
            throw new Error(errorData.message || "Failed to fetch products");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const createProduct = async (token, productData) => {
    const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
    }
    return data;
};

export const updateProduct = async (token, id, productData) => {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error || 'Failed to update product');
    }
    return data;
};

export const deleteProduct = async (token, id) => {
    try {
        console.log("Deleting product at:", `${REACT_APP_URI}/products/${id}`);
        const response = await fetch(`${REACT_APP_URI}/products/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to delete product");
        return true;
    } catch (error) {
        message.error(error.message);
        throw error;
    }
};

export const fetchProductById = async (token, id) => {
    try {
        console.log("Fetching product from:", `${REACT_APP_URI}/products/${id}`);
        const response = await fetch(`${REACT_APP_URI}/products/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) throw new Error("Failed to fetch product");
        return await response.json();
    } catch (error) {
        message.error(error.message);
        throw error;
    }
};
