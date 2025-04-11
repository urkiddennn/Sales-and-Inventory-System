// src/components/LoginPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login as apiLogin } from "../../api"; // Adjust path if needed
import { useAuth } from "./AuthContext"; // Adjust path if needed

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const response = await apiLogin({ email, password });
            console.log("API Login Response:", response);

            // Validate response structure
            if (!response || !response.token || !response.user || !response.user.role) {
                console.error("Login response missing expected fields:", response);
                setError("Login failed: Unexpected response from server.");
                setIsLoading(false);
                return;
            }

            const { token, user } = response;

            // Call AuthContext login with token and role
            authLogin(token, user.role);

            // Navigate based on role
            if (user.role === "admin") {
                console.log("Admin user detected. Navigating to /admin/products");
                navigate("/admin/products");
            } else {
                console.log("Regular user detected. Navigating to /");
                navigate("/");
            }
        } catch (err) {
            console.error("Login API call failed:", err);
            // Use err.status from api.jsx's custom Error
            if (err.status === 401) {
                setError("Invalid email or password. Please try again.");
            } else {
                setError(err.message || "Login failed. Please try again later.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Login to Your Account</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="your@email.com"
                        autoComplete="email"
                    />
                </div>

                {/* Password Input */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                            Remember me
                        </label>
                    </div>
                    <div className="text-sm">
                        <Link to="/forgot-password" className="font-medium text-green-600 hover:text-green-500">
                            Forgot your password?
                        </Link>
                    </div>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                        {isLoading ? "Signing in..." : "Sign in"}
                    </button>
                </div>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <Link to="/signup" className="font-medium text-green-600 hover:text-green-500">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
