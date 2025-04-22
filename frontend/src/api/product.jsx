// src/api.js
import { message } from "antd";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000/api";

export const fetchProducts = async () => {
    try {
        console.log("Fetching products from:", `${BASE_URL}/products`);
        const response = await fetch(`${BASE_URL}/products`);

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
export const createProduct = async (token, formData) => {
    try {
        console.log("Creating product at:", `${BASE_URL}/products`);
        console.log("Token:", token);
        console.log("Form Data:", formData);

        const response = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error Response:", errorData);
            throw new Error(errorData.message || "Failed to create product");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};
export const updateProduct = async (token, id, { isOnSale, salePrice }) => {
    try {
        console.log("Updating product at:", `${BASE_URL}/products/${id}/sale`);
        const response = await fetch(`${BASE_URL}/products/${id}/sale`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isOnSale, salePrice }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update product");
        }
        return await response.json();
    } catch (error) {
        message.error(error.message);
        throw error;
    }
};

export const deleteProduct = async (token, id) => {
    try {
        console.log("Deleting product at:", `${BASE_URL}/products/${id}`);
        const response = await fetch(`${BASE_URL}/products/${id}`, {
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
        console.log("Fetching product from:", `${BASE_URL}/products/${id}`);
        const response = await fetch(`${BASE_URL}/products/${id}`, {
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
