import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { register } from "../../api/"; // Import register function

const AuthContext = createContext({
    isAuthenticated: false,
    userRole: null,
    loading: true,
    login: (token, role) => { },
    logout: () => { },
    signup: async (userData) => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("userRole");

        if (token) {
            try {
                const decoded = jwtDecode(token);
                console.log("Decoded JWT on load:", decoded);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token expired");
                    message.error("Session expired. Please log in again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userRole");
                    setIsAuthenticated(false);
                    setUserRole(null);
                } else if (storedRole && decoded.role === storedRole) {
                    setIsAuthenticated(true);
                    setUserRole(storedRole);
                } else {
                    console.log("Role mismatch or missing");
                    message.error("Invalid session state. Please log in again.");
                    localStorage.removeItem("token");
                    localStorage.removeItem("userRole");
                    setIsAuthenticated(false);
                    setUserRole(null);
                }
            } catch (error) {
                console.error("Invalid token:", error);
                message.error("Invalid session. Please log in again.");
                localStorage.removeItem("token");
                localStorage.removeItem("userRole");
                setIsAuthenticated(false);
                setUserRole(null);
            }
        } else {
            setIsAuthenticated(false);
            setUserRole(null);
        }
        setLoading(false);
    }, []);

    const login = (token, role) => {
        try {
            const decoded = jwtDecode(token);
            console.log("Login JWT:", decoded);
            if (decoded.role !== role) {
                throw new Error("Role mismatch in token");
            }
            localStorage.setItem("token", token);
            localStorage.setItem("userRole", role);
            setIsAuthenticated(true);
            setUserRole(role);
            console.log("Logged in successfully. Role:", role);
        } catch (error) {
            console.error("Login error:", error);
            message.error("Failed to log in. Invalid token.");
            logout();
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUserRole(null);
        message.success("Logged out successfully");
    };

    const signup = async (userData) => {
        try {
            const data = await register(userData); // Use register from api.jsx
            if (!data.token || !data.user?.role) {
                throw new Error("Invalid response from server");
            }
            login(data.token, data.user.role); // Automatically log in the user
            return data;
        } catch (error) {
            console.error("Error during registration:", error);
            throw error;
        }
    };

    const contextValue = {
        isAuthenticated,
        userRole,
        loading,
        login,
        logout,
        signup,
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
