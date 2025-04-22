import React from 'react';
import { Link } from 'react-router-dom';
// Importing icons from React Icons
import { FaPhone, FaEnvelope, FaFacebook, FaTiktok } from 'react-icons/fa';
import logoImg from "../assets/logo.png"
const Footer = () => {
    const logoStyle = {
        backgroundImage: `url(${logoImg})`,// Replace with your image URL
        backgroundSize: 'contain', // Ensures the image covers the entire div
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }
    return (
        <footer className="bg-white border-t py-6">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Logo/Brand */}
                <div className='flex flex-col items-start gap-2 w-full justify-center'>
                    <div className='w-46 h-46' style={logoStyle}></div>


                </div>


                {/* Shop Links */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop</h3>
                    <ul className="space-y-2">
                        <li>
                            <Link to="/" className="text-gray-600 hover:underline">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to="/products" className="text-gray-600 hover:underline">
                                Products
                            </Link>
                        </li>
                        <li>
                            <Link to="/cart" className="text-gray-600 hover:underline">
                                Cart
                            </Link>
                        </li>
                        <li>
                            <Link to="/profile" className="text-gray-600 hover:underline">
                                Profile
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Need Help Links */}


                {/* Contact Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Info</h3>
                    <ul className="space-y-2">
                        <li className="flex items-center text-gray-600">
                            <FaPhone className="mr-2 text-yellow-400" />
                            <span>09322834646 / 09266043515</span>
                        </li>
                        <li className="flex items-center text-gray-600">
                            <FaEnvelope className="mr-2 text-yellow-400" />
                            <a href="mailto:cg3solarproducts.trading@gmail.com" className="hover:underline">
                                cg3solarproducts.trading@gmail.com
                            </a>
                        </li>
                        <li className="flex items-center text-gray-600">
                            <FaFacebook className="mr-2 text-yellow-400" />
                            <a
                                href="https://www.facebook.com/cg3trading"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                Facebook
                            </a>
                        </li>
                        <li className="flex items-center text-gray-600">
                            <FaTiktok className="mr-2 text-yellow-400" />
                            <a
                                href="https://www.tiktok.com/@cg3solarproductstrading"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                            >
                                TikTok
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="bg-yellow-400 text-center py-4 mt-6">
                <p className="text-gray-800">© 2025 CG3 Solar Products Tading</p>
            </div>
        </footer>
    );
};

export default Footer;
