// src/api/user.js
import { message } from "antd";

const BASE_URL = process.env.VITE_API_URL;

export const fetchUsers = async (token) => {
    try {
        console.log("Fetching users from:", `${BASE_URL}/getAllUsers`);
        const response = await fetch(`${BASE_URL}/getAllUsers`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch users");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const fetchUserById = async (token, id) => {
    try {
        console.log("Fetching user from:", `${BASE_URL}/users/${id}`);
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch user");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const createUser = async (token, userData) => {
    try {
        console.log("Creating user at:", `${BASE_URL}/auth/register`);
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`, // Remove if not required
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to create user");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const updateUser = async (token, id, userData) => {
    try {
        console.log("Updating user at:", `${BASE_URL}/users/${id}`);
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const updateUserStatus = async (token, id, active) => {
    try {
        console.log("Updating user status at:", `${BASE_URL}/users/${id}`);
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ active }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to update user status");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const deleteUser = async (token, id) => {
    try {
        console.log("Deleting user at:", `${BASE_URL}/users/${id}`);
        const response = await fetch(`${BASE_URL}/users/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete user");
        }

        return true;
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};

export const fetchAdminUser = async (token) => {
    try {
        console.log("Fetching admin user from:", `${BASE_URL}/users/admin`);
        const response = await fetch(`${BASE_URL}/users/admin`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch admin user");
        }

        return await response.json();
    } catch (error) {
        message.error(error.message || "An unexpected error occurred");
        throw error;
    }
};
