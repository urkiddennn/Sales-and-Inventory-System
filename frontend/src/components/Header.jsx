import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoMdSearch } from 'react-icons/io';
import { MdFavoriteBorder } from 'react-icons/md';
import { TiShoppingCart } from 'react-icons/ti';
import { FaBars, FaTimes } from 'react-icons/fa';
import { BsChatDots } from 'react-icons/bs';
import { FaUser } from 'react-icons/fa';
import { useAuth } from '../components/auth/AuthContext';

const Header = ({ onCartClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    console.log("Header:", { isAuthenticated, path: location.pathname, isMenuOpen });

    const toggleMenu = () => {
        console.log("Header: Toggling menu, current state:", isMenuOpen);
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        console.log("Header: Logout clicked");
        logout();
        navigate("/"); // Navigate to home after logout
        console.log("Header: Navigated to / after logout");
    };

    const handleLinkClick = (path) => {
        console.log(`Header: Link clicked: ${path}`);
        setIsMenuOpen(false); // Close menu on mobile
    };

    return (
        <header className="text-white flex flex-col">
            <div className="w-full h-10 bg-green-700 flex items-center justify-center">
                <span className="text-sm">Solar Products Trading</span>
            </div>
            <div className="w-full bg-white text-gray-800 px-4 sm:px-6 lg:px-10 py-4 flex justify-between items-center">
                <div className="text-xl font-bold">Sales Inventory</div>

                <nav
                    className={`${isMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row absolute lg:static top-24 left-0 w-full lg:w-auto bg-white lg:bg-transparent text-gray-800 lg:space-x-4 space-y-4 lg:space-y-0 p-4 lg:p-0 z-50`}
                >
                    <Link to="/" className="hover:underline" onClick={() => handleLinkClick('/')}>
                        Home
                    </Link>
                    <Link to="/products" className="hover:underline" onClick={() => handleLinkClick('/products')}>
                        Products
                    </Link>
                    <Link to="/cart" className="hover:underline" onClick={() => handleLinkClick('/cart')}>
                        Cart
                    </Link>
                    <Link to="/orders" className="hover:underline" onClick={() => handleLinkClick('/orders')}>
                        Orders
                    </Link>
                    <Link to="/about" className="hover:underline" onClick={() => handleLinkClick('/about')}>
                        About
                    </Link>
                    <Link to="/contact" className="hover:underline" onClick={() => handleLinkClick('/contact')}>
                        Contact
                    </Link>
                </nav>

                <div className="hidden lg:flex space-x-4 items-center">
                    <button>
                        <IoMdSearch size="1.7em" className="text-gray-800" />
                    </button>
                    <button onClick={onCartClick}>
                        <TiShoppingCart size="1.7em" className="text-gray-800" />
                    </button>
                    {isAuthenticated ? (
                        <>
                            <Link to="/chats" onClick={() => handleLinkClick('/chats')}>
                                <BsChatDots size="1.5em" className="text-gray-800" />
                            </Link>
                            <Link to="/profile" onClick={() => handleLinkClick('/profile')}>
                                <FaUser size="1.5em" className="text-gray-800" />
                            </Link>

                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-green-700 text-white ml-3 px-3 py-1 rounded hover:bg-green-600"
                                onClick={() => handleLinkClick('/login')}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
                                onClick={() => handleLinkClick('/signup')}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <div className="flex lg:hidden space-x-2 items-center">


                    {isAuthenticated ? (
                        <>
                            <Link to="/chats" onClick={() => handleLinkClick('/chats')}>
                                <BsChatDots size="1.5em" className="text-gray-800" />
                            </Link>
                            <Link to="/profile" onClick={() => handleLinkClick('/profile')}>
                                <FaUser size="1.5em" className="text-gray-800" />
                            </Link>

                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600"
                                onClick={() => handleLinkClick('/login')}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
                                onClick={() => handleLinkClick('/signup')}
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                <button className="lg:hidden text-gray-800" onClick={toggleMenu}>
                    {isMenuOpen ? <FaTimes size="1.5em" /> : <FaBars size="1.5em" />}
                </button>
            </div>
        </header>
    );
};

export default Header;
