import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { register, login as apiLogin } from "../../api/";

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    userRole: null,
    loading: true,
    login: async (email, password) => false,
    logout: () => { },
    signup: async (userData) => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            const storedRole = localStorage.getItem("userRole");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    message.error("Session expired. Please log in again.");
                    logout();
                    return;
                }
                await fetchUser(token);
            } catch (error) {
                message.error("Invalid session. Please log in again.");
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const fetchUser = async (token) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!response.ok) {
                throw new Error("Failed to fetch user");
            }
            const userData = await response.json();
            setUser({
                id: userData._id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
            });
            setUserRole(userData.role);
            setIsAuthenticated(true);
        } catch (error) {
            throw new Error("Invalid session");
        }
    };

    const login = async (email, password) => {
        try {
            const data = await apiLogin({ email, password });
            if (!data?.token || !data?.user?.role) {
                throw new Error("Invalid response from server");
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
                role: data.user.role,
            });
            setUserRole(data.user.role);
            setIsAuthenticated(true);
            return true;
        } catch (error) {
            message.error(error.message || "Failed to log in");
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        message.success("Logged out successfully");
    };

    const signup = async (userData) => {
        try {
            const data = await register(userData);
            if (!data?.token || !data?.user?.role) {
                throw new Error("Invalid response from server");
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            setUser({
                id: data.user.id,
                email: data.user.email,
                name: userData.name,
                role: data.user.role,
            });
            setUserRole(data.user.role);
            setIsAuthenticated(true);
            return data;
        } catch (error) {
            message.error(error.message || "Failed to register");
            throw error;
        }
    };

    const contextValue = {
        isAuthenticated,
        user,
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
