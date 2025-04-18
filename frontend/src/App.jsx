import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/" />;
    }

    return children;
};

const AdminRoute = ({ children }) => {
    return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
};

const AppContent = () => {
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated) {
                try {
                    const token = localStorage.getItem("token");
                    if (!token) {
                        throw new Error("No authentication token found");
                    }
                    const data = await getCart(token);
                    setCart(data || { items: [] });
                } catch (error) {
                    console.error("Error fetching cart:", error);
                    setCart({ items: [] });
                }
            } else {
                setCart({ items: [] });
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    const handleAddToCart = (updatedCart) => {
        setCart(updatedCart);
        setIsCartOpen(true);
    };

    const handleUpdateCart = (updatedCart) => {
        setCart(updatedCart || { items: [] });
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    const NonAdminLayout = ({ children }) => (
        <div className="min-h-screen flex flex-col">
            <Header onCartClick={toggleCart} />
            <main className="flex-grow">{children}</main>
            <Footer />
            <ShoppingCart
                cart={cart}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateCart={handleUpdateCart}
            />
        </div>
    );

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
                        <ProtectedRoute>
                            <CartPage cart={cart} onUpdateCart={handleUpdateCart} />
                        </ProtectedRoute>
                    </NonAdminLayout>
                }
            />
            <Route path="/orders" element={
                <NonAdminLayout>
                    <OrdersPage />
                </NonAdminLayout>
            } />
            <Route path="/orders/:id" element={
                <NonAdminLayout>
                    <OrderPage />
                </NonAdminLayout>
            } />
            <Route
                path="/products"
                element={
                    <NonAdminLayout>
                        <ProductsPage onAddToCart={handleAddToCart} />
                    </NonAdminLayout>
                }
            />
            <Route path="/products/:productId" element={
                <NonAdminLayout>
                    <ProductDescriptionPage />
                </NonAdminLayout>
            } />
            <Route
                path="/login"
                element={
                    <NonAdminLayout>
                        <LoginPage />
                    </NonAdminLayout>
                }
            />
            <Route
                path="/signup"
                element={
                    <NonAdminLayout>
                        <SignupPage />
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
                        <ProtectedRoute>
                            <ChatPage />
                        </ProtectedRoute>
                    </NonAdminLayout>
                }
            />
            <Route
                path="*"
                element={
                    <NonAdminLayout>
                        <div className="p-6">404 - Page Not Found</div>
                    </NonAdminLayout>
                }
            />
        </Routes>
    );
};

const App = () => {
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
