import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import FeaturedSection from './components/FeaturedSection';
import Reviews from './components/Reviews';
import Footer from './components/Footer';
import ShoppingCart from './components/ShoppingCart';
import CartPage from './components/cart/CartPage'; // New component
import { getCart } from './api';
import Hero from './components/hero/Hero';
import Gap from "./components/Gap"

const App = () => {
    const [cart, setCart] = useState({ items: [] });
    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getCart(token);
                setCart(data);
            } catch (error) {
                console.error('Error fetching cart:', error);
            }
        };
        fetchCart();
    }, []);

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
        <Router>
            <div className="min-h-screen flex flex-col">
                <Header onCartClick={toggleCart} />
                <main className="flex-grow">
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <>
                                    <Hero />
                                    <Gap />
                                    <ProductGrid onAddToCart={handleAddToCart} />
                                    <FeaturedSection />
                                    <Reviews />
                                </>
                            }
                        />
                        <Route
                            path="/cart"
                            element={<CartPage cart={cart} onUpdateCart={handleUpdateCart} />}
                        />
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
        </Router>
    );
};

export default App;
