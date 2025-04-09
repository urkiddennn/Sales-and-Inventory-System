import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoMdSearch } from 'react-icons/io';
import { MdFavoriteBorder } from 'react-icons/md';
import { TiShoppingCart } from 'react-icons/ti';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../components/auth/AuthContext';

const Header = ({ onCartClick }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated, logout } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <header className="text-white flex flex-col">
            <div className="w-full h-10 bg-green-700 flex items-center justify-center">
                <span className="text-sm">Solar Products Trading</span>
            </div>
            <div className="w-full bg-white text-gray-800 px-4 sm:px-6 lg:px-10 py-4 flex justify-between items-center">
                <div className="text-xl font-bold">Sales Inventory</div>

                <nav
                    className={`${isMenuOpen ? 'flex' : 'hidden'
                        } lg:flex flex-col lg:flex-row absolute lg:static top-24 left-0 w-full lg:w-auto bg-white lg:bg-transparent text-gray-800 lg:space-x-4 space-y-4 lg:space-y-0 p-4 lg:p-0 z-50`}
                >
                    <Link to="/" className="hover:underline">
                        Home
                    </Link>
                    <Link to="/products" className="hover:underline">
                        Products
                    </Link>
                    <Link to="/cart" className="hover:underline">
                        Cart
                    </Link>
                    <Link to="/about" className="hover:underline">
                        About
                    </Link>
                    <Link to="/contact" className="hover:underline">
                        Contact
                    </Link>
                </nav>
                <div className="hidden lg:flex space-x-2 items-center">
                    <button>
                        <IoMdSearch size="1.5em" className="text-gray-800" />
                    </button>
                    <button>
                        <MdFavoriteBorder size="1.5em" className="text-gray-800" />
                    </button>
                    <button onClick={onCartClick}>
                        <TiShoppingCart size="1.5em" className="text-gray-800" />
                    </button>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white ml-3 px-3 py-1 rounded hover:bg-red-500"
                        >
                            Logout
                        </button>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="bg-green-700 text-white ml-3 px-3 py-1 rounded hover:bg-green-600"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-yellow-500 text-black px-3 py-1 rounded hover:bg-yellow-400"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
                <div className="flex lg:hidden space-x-2 items-center">
                    <button>
                        <IoMdSearch size="1.5em" className="text-gray-800" />
                    </button>
                    <button onClick={onCartClick}>
                        <TiShoppingCart size="1.5em" className="text-gray-800" />
                    </button>
                    {isAuthenticated ? (
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500"
                        >
                            Logout
                        </button>
                    ) : (
                        <Link to="/login" className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-600">
                            Login
                        </Link>
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
