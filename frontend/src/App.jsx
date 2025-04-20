import { useState, useEffect, memo } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { message } from "antd";
import Header from "./components/Header";
import ProductGrid from "./components/ProductGrid";
import FeaturedSection from "./components/FeaturedSection";
import Reviews from "./components/Reviews";
import Footer from "./components/Footer";
import ShoppingCart from "./components/ShoppingCart";
import CartPage from "./components/cart/CartPage";
import ProductsPage from "./components/products/ProductPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { AuthProvider, useAuth } from "./components/auth/AuthContext";
import { getCart } from "./api";
import Hero from "./components/hero/Hero";
import Gap from "./components/Gap";
import YellowGap from "./components/YellowGap";
import BestDeals from "./components/BestDeals";
import Admin from "./Admin/Admin";
import { CartProvider } from "./components/cart/CartContext";
import Profile from "./components/profile/Profile";
import ProductDescriptionPage from "./components/products/ProductDescriptionPage";
import OrdersPage from "./components/order/OrdersPage";
import OrderPage from "./components/order/OrderPage";
import ChatPage from "./components/chat/ChatPage";

// Public route component
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading, userRole } = useAuth();
    const location = useLocation();
    console.log("PublicRoute:", { isAuthenticated, userRole, loading, path: location.pathname });

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    // Only redirect authenticated users from /login or /signup if they are not admins
    if (isAuthenticated && ["/login", "/signup"].includes(location.pathname)) {
        if (userRole === "admin") {
            console.log("PublicRoute: Admin user detected, allowing LoginPage to handle navigation");
            return children; // Let LoginPage handle navigation to /admin
        }
        console.log("PublicRoute: Redirecting authenticated non-admin user to / from", location.pathname);
        return <Navigate to="/" replace />;
    }

    console.log("PublicRoute: Rendering route:", location.pathname);
    return children;
};

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, userRole, loading } = useAuth();
    const location = useLocation();
    console.log("ProtectedRoute:", { isAuthenticated, userRole, loading, path: location.pathname });

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!isAuthenticated) {
        console.log("ProtectedRoute: Redirecting to /login: Not authenticated");
        message.error("Please log in to access this page.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        console.log(`ProtectedRoute: Redirecting to /: Missing required role ${requiredRole}`);
        message.error(`You need ${requiredRole} privileges to access this page`);
        return <Navigate to="/" replace />;
    }

    console.log("ProtectedRoute: Rendering route:", location.pathname);
    return children;
};

const AdminRoute = ({ children }) => {
    return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};

const NonAdminLayout = memo(({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    console.log("NonAdminLayout: Rendering for path:", location.pathname, { isAuthenticated, loading });

    return (
        <div className="min-h-screen flex flex-col">
            <Header onCartClick={() => console.log("Cart clicked")} />
            <main className="flex-grow">{children}</main>
            <Footer />
        </div>
    );
});

const AppContent = () => {
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log("AppContent:", { isAuthenticated, loading, path: location.pathname });

    useEffect(() => {
        const fetchCart = async () => {
            console.log("AppContent: Fetching cart, isAuthenticated:", isAuthenticated);
            if (isAuthenticated) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No authentication token found");
                    }
                    const data = await getCart(token);
                    setCart(data || { items: [] });
                    console.log("AppContent: Cart fetched:", data);
                } catch (error) {
                    console.error("AppContent: Error fetching cart:", error.message);
                    setCart({ items: [] });
                }
            } else {
                setCart({ items: [] });
                console.log("AppContent: Cart reset (not authenticated)");
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    const handleAddToCart = (updatedCart) => {
        console.log("AppContent: Adding to cart:", updatedCart);
        setCart(updatedCart);
        setIsCartOpen(true);
    };

    const handleUpdateCart = (updatedCart) => {
        console.log("AppContent: Updating cart:", updatedCart);
        setCart(updatedCart || { items: [] });
    };

    const toggleCart = () => {
        console.log("AppContent: Toggling cart, isCartOpen:", !isCartOpen);
        setIsCartOpen(!isCartOpen);
    };

    return (
        <Routes>
            <Route
                path="/admin/*"
                element={
                    <AdminRoute>
                        <Admin />
                    </AdminRoute>
                }
            />
            <Route
                path="/"
                element={
                    <NonAdminLayout>
                        <Hero />
                        <div className="lg:p-20 p-2">
                            <Gap />
                            <ProductGrid onAddToCart={handleAddToCart} />
                            <YellowGap />
                            <Gap />
                            <FeaturedSection />
                            <Gap />
                            <BestDeals />
                            <Reviews />
                        </div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/cart"
                element={
                    <NonAdminLayout>
                        <CartPage cart={cart} onUpdateCart={handleUpdateCart} />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/orders"
                element={
                    <NonAdminLayout>
                        <OrdersPage />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/orders/:id"
                element={
                    <NonAdminLayout>
                        <OrderPage />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/products"
                element={
                    <NonAdminLayout>
                        <ProductsPage onAddToCart={handleAddToCart} />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/products/:productId"
                element={
                    <NonAdminLayout>
                        <ProductDescriptionPage />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/login"
                element={
                    <NonAdminLayout>
                        <PublicRoute>
                            <LoginPage />
                        </PublicRoute>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/signup"
                element={
                    <NonAdminLayout>
                        <PublicRoute>
                            <SignupPage />
                        </PublicRoute>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/about"
                element={
                    <NonAdminLayout>
                        <div className="p-6">About Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/contact"
                element={
                    <NonAdminLayout>
                        <div className="p-6">Contact Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/faq"
                element={
                    <NonAdminLayout>
                        <div className="p-6">FAQ Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/return-policy"
                element={
                    <NonAdminLayout>
                        <div className="p-6">Return Policy Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/privacy-policy"
                element={
                    <NonAdminLayout>
                        <div className="p-6">Privacy Policy Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/forgot-password"
                element={
                    <NonAdminLayout>
                        <div className="p-6">Forgot Password Page (Placeholder)</div>
                    </NonAdminLayout>
                }
            />
            <Route
                path="/profile"
                element={
                    <NonAdminLayout>
                        <Profile />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/chats"
                element={
                    <NonAdminLayout>
                        <ChatPage />
                    </NonAdminLayout>
                }
            />
            <Route
                path="*"
                element={
                    <NonAdminLayout>
                        <div className="p-6">
                            404 - Page Not Found (Path: {location.pathname})
                        </div>
                    </NonAdminLayout>
                }
            />
        </Routes>
    );
};

const App = () => {
    console.log("App: Rendering App component");
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
