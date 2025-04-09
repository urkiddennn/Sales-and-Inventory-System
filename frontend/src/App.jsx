import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import FeaturedSection from './components/FeaturedSection';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import ShoppingCart from './components/ShoppingCart';
import CartPage from './components/cart/CartPage';
import ProductsPage from './components/products/ProductPage';
import LoginPage from './components/auth/LoginPage';
import SignupPage from './components/auth/SignupPage';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { getCart } from './api';
import Hero from './components/hero/Hero';
import Gap from './components/Gap';
import YellowGap from './components/YellowGap';
import BestDeals from './components/BestDeals';

// Protected route component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

const AppContent = () => {
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchCart = async () => {
            if (isAuthenticated) {
                try {
                    const token = localStorage.getItem('token');
                    const data = await getCart(token);
                    setCart(data);
                } catch (error) {
                    console.error('Error fetching cart:', error);
                }
            } else {
                setCart({ items: [] }); // Clear cart if not authenticated
            }
        };
        fetchCart();
    }, [isAuthenticated]);

    const handleAddToCart = (updatedCart) => {
        setCart(updatedCart);
        setIsCartOpen(true);
    };

    const handleUpdateCart = (updatedCart) => {
        setCart(updatedCart);
    };

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header onCartClick={toggleCart} />
            <main className="flex-grow">
                <Routes>
                    <Route
                        path="/"
                        element={
                            < >
                                <Hero />
                                <div className='lg:p-20 p-2'>

                                    <Gap />
                                    <ProductGrid onAddToCart={handleAddToCart} />
                                    <YellowGap />
                                    <Gap />
                                    <FeaturedSection />
                                    <Gap />
                                    <BestDeals />
                                    <Reviews />
                                </div>


                            </>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <CartPage cart={cart} onUpdateCart={handleUpdateCart} />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/products" element={<ProductsPage onAddToCart={handleAddToCart} />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/about" element={<div className="p-6">About Page (Placeholder)</div>} />
                    <Route path="/contact" element={<div className="p-6">Contact Page (Placeholder)</div>} />
                    <Route path="/faq" element={<div className="p-6">FAQ Page (Placeholder)</div>} />
                    <Route path="/return-policy" element={<div className="p-6">Return Policy Page (Placeholder)</div>} />
                    <Route path="/privacy-policy" element={<div className="p-6">Privacy Policy Page (Placeholder)</div>} />
                    <Route path="/forgot-password" element={<div className="p-6">Forgot Password Page (Placeholder)</div>} />
                </Routes>
            </main>
            <Footer />
            <ShoppingCart
                cart={cart}
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                onUpdateCart={handleUpdateCart}
            />
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </Router>
    );
};

export default App;
