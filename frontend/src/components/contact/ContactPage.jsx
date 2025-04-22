import React from 'react';

import { FaFacebook, FaTiktok, FaEnvelope, FaMapMarked } from 'react-icons/fa';
import { FaPhoneFlip } from "react-icons/fa6";
import logoImg from "../../assets/logo.png"
function ContactPage() {
    const logoStyle = {
        backgroundImage: `url(${logoImg})`,// Replace with your image URL
        backgroundSize: 'contain', // Ensures the image covers the entire div
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
    }
    return (
        <div className="bg-white text-green-700 min-h-screen flex flex-col items-center p-6">
            {/* Logo */}
            <div className='w-64 h-40 mb-5' style={logoStyle}>

            </div>
            {/* Product Owner Name and Contact Details */}
            <section className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-green-700">Gretchen R Fernandez</h1>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                    <FaPhoneFlip className="inline-block mr-2 text-green-700" />
                    <span>09322834646 / 09266043515</span> <br />
                    <FaEnvelope className="inline-block mr-2 text-green-700" />
                    <a href="mailto:cg3solarproducts.trading@gmail.com" className="underline hover:text-green-500">
                        cg3solarproducts.trading@gmail.com
                    </a>
                    <br />
                    <strong className="text-green-700 mt-4 block">Social Media:</strong>
                    <div className="flex justify-center space-x-4 mt-2">
                        <a
                            href="https://www.facebook.com/cg3trading"
                            className="hover:text-yellow-500"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaFacebook size="1.2em" className="text-yellow-400" />
                        </a>
                        <a
                            href="https://www.tiktok.com/@cg3solarproductstrading"
                            className="hover:text-yellow-500"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaTiktok size="1.2em" className="text-yellow-400" />
                        </a>
                    </div>
                </p>
            </section>

            {/* Legal/Documents Needs */}
            <section className="mb-8 text-center">
                <h2 className="text-xl font-bold text-green-700">Legal/Documents Information</h2>
                <p className="mt-4 text-lg leading-relaxed text-gray-700">
                    <FaMapMarked className="inline-block mr-2 text-green-700" />
                    Location: 147 Brgy Soro-Soro, Binan, Laguna <br />
                    <FaPhoneFlip className="inline-block mr-2 text-green-700" />
                    Contact: 09322834646 (Viber/WhatsApp: 09266043515) <br />
                    <FaEnvelope className="inline-block mr-2 text-green-700" />
                    Email:{' '}
                    <a href="mailto:cg3solarproducts.trading@gmail.com" className="underline hover:text-green-500">
                        cg3solarproducts.trading@gmail.com
                    </a>
                    <br />
                    <strong className="text-green-700">Gcash:</strong> 09322834646 (Gretchen R) <br />
                    <strong className="text-green-700">BDO Account:</strong> CG3 Solar Products Trading - 010650216091
                </p>
            </section>
        </div>
    );
}

export default ContactPage;
