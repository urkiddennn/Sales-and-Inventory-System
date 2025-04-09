import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-white border-t py-6">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Logo/Brand */}
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Solar Products Trading</h3>
                    <img
                        src="https://via.placeholder.com/150"
                        alt="Footer Placeholder"
                        className="w-32 h-32 object-cover"
                    />
                </div>

                {/* Shop Links */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/products" className="text-gray-600 hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/categories" className="text-gray-600 hover:underline">
                                Categories
                            </Link>
                        </li>
                        <li>
                            <Link to="/about" className="text-gray-600 hover:underline">
                                About Us
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Need Help Links */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/contact" className="text-gray-600 hover:underline">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="text-gray-600 hover:underline">
                                FAQs
                            </Link>
                        </li>
                        <li>
                            <Link to="/return-policy" className="text-gray-600 hover:underline">
                                Return Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/privacy-policy" className="text-gray-600 hover:underline">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Need Help Links (Duplicate for Wireframe) */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Need Help</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/contact" className="text-gray-600 hover:underline">
                                Contact
                            </Link>
                        </li>
                        <li>
                            <Link to="/faq" className="text-gray-600 hover:underline">
                                FAQs
                            </Link>
                        </li>
                        <li>
                            <Link to="/return-policy" className="text-gray-600 hover:underline">
                                Return Policy
                            </Link>
                        </li>
                        <li>
                            <Link to="/privacy-policy" className="text-gray-600 hover:underline">
                                Privacy Policy
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="bg-yellow-400 text-center py-4 mt-6">
                <p className="text-gray-800">© 2023 Solar Products Trading</p>
            </div>
        </footer>
    );
};

export default Footer;
