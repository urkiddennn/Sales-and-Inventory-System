// src/api.js
import { message } from "antd";

const BASE_URL = '/api';

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
        console.log("Form Data contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await fetch(`${BASE_URL}/products`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        // Log raw response
        const text = await response.text();
        console.log("Raw response:", text);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse response as JSON:", text);
                throw new Error("Server returned invalid JSON");
            }
            console.error("Error Response:", errorData);
            throw new Error(errorData.error || "Failed to create product");
        }

        return JSON.parse(text);
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};
export const updateProduct = async (token, id, formData) => {
    try {
        console.log("Updating product at:", `${BASE_URL}/products/${id}`);
        console.log("FormData contents:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        const response = await fetch(`${BASE_URL}/products/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const text = await response.text();
        console.log("Raw response:", text);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse response as JSON:", text);
                throw new Error("Server returned invalid JSON");
            }
            console.error("Error Response:", errorData);
            throw new Error(errorData.error || "Failed to update product");
        }

        return JSON.parse(text);
    } catch (error) {
        console.error("Update product error:", error);
        message.error(error.message || "An unexpected error occurred");
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
