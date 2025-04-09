import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-6">
            <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                    <h3 className="text-lg font-bold">Email Us</h3>
                    <p>support@salesinventory.com</p>
                </div>
                <div className="flex space-x-4">
                    <div>
                        <h3 className="text-lg font-bold">Shop</h3>
                        <ul>
                            <li><a href="#" className="hover:underline">Products</a></li>
                            <li><a href="#" className="hover:underline">Categories</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Account</h3>
                        <ul>
                            <li><a href="#" className="hover:underline">Profile</a></li>
                            <li><a href="#" className="hover:underline">Orders</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Support</h3>
                        <ul>
                            <li><a href="#" className="hover:underline">FAQ</a></li>
                            <li><a href="#" className="hover:underline">Contact</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <p className="text-center mt-4">&copy; 2025 Sales Inventory. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
