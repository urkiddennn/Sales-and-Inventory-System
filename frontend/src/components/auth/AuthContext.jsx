import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { jwtDecode } from "jwt-decode";
import { register, login as apiLogin } from "../../api";

const AuthContext = createContext({
    isAuthenticated: false,
    user: null,
    userRole: null,
    loading: true,
    login: async () => false,
    logout: () => { },
    signup: async () => { },
});

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log("AuthProvider state:", { isAuthenticated, userRole, loading });

    const validateToken = useCallback((token) => {
        try {
            const decoded = jwtDecode(token);
            console.log("validateToken: Decoded token:", decoded);
            const currentTime = Date.now() / 1000;
            if (decoded.exp < currentTime) {
                console.log("validateToken: Token expired");
                message.warning("Your session has expired. Please log in again.");
                return false;
            }
            return decoded;
        } catch (error) {
            console.error("validateToken: Invalid token:", error.message);
            message.error("Invalid session. Please log in again.");
            return false;
        }
    }, []);

    const initializeAuth = useCallback(() => {
        console.log("initializeAuth: Starting");
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedRole = localStorage.getItem("userRole");
        console.log("initializeAuth: Token found:", !!token, "Stored role:", storedRole);

        if (!token) {
            console.log("initializeAuth: No token, setting unauthenticated state");
            setIsAuthenticated(false);
            setUser(null);
            setUserRole(null);
            setLoading(false);
            return;
        }

        const decoded = validateToken(token);
        if (!decoded) {
            console.log("initializeAuth: Invalid or expired token, logging out");
            logout();
            return;
        }

        if (decoded.role && decoded.role === storedRole) {
            console.log("initializeAuth: Valid token, setting authenticated state");
            setUser({
                id: decoded.id,
                email: decoded.email || "unknown",
                name: decoded.name || "Unknown",
                role: decoded.role,
            });
            setUserRole(decoded.role);
            setIsAuthenticated(true);
        } else {
            console.log("initializeAuth: Role mismatch or invalid role");
            message.error("Session validation failed. Please log in again.");
            logout();
        }
        console.log("initializeAuth: Complete");
        setLoading(false);
    }, [validateToken]);

    useEffect(() => {
        console.log("useEffect: Running initializeAuth");
        initializeAuth();
    }, [initializeAuth]);

    const login = async (email, password) => {
        try {
            console.log("login: Logging in with:", { email });
            const data = await apiLogin({ email, password });
            console.log("login: Full API response:", data);
            if (!data?.token) {
                throw new Error("No token in response");
            }
            const role = data.user?.role;
            if (!role) {
                throw new Error("No role found in response");
            }
            const normalizedRole = role.toLowerCase();
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", normalizedRole);
            console.log("login: Stored token:", data.token.slice(0, 20) + "...", "Stored role:", normalizedRole);
            initializeAuth();
            return { success: true, role: normalizedRole };
        } catch (error) {
            console.error("login: Login error:", error.message);
            message.error(error.message || "Failed to log in");
            return { success: false };
        }
    };

    const logout = () => {
        console.log("logout: Logging out");
        localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
        message.success("Logged out successfully");
        console.log("logout: Complete");
    };

    const signup = async (userData) => {
        try {
            console.log("signup: Signing up with:", userData);
            const data = await register(userData);
            console.log("signup: Signup response:", data);
            if (!data?.token || !data?.user?.role) {
                throw new Error("Invalid response from server");
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.user.role);
            console.log("signup: Stored token:", data.token.slice(0, 20) + "...", "Stored role:", data.user.role);
            initializeAuth();
            return data;
        } catch (error) {
            console.error("signup: Signup error:", error.message);
            message.error(error.message || "Failed to register");
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                userRole,
                loading,
                login,
                logout,
                signup,
            }}
        >
            {children}
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
