import React from 'react';
import { FaShippingFast } from 'react-icons/fa';
import { LuBicepsFlexed } from 'react-icons/lu';
import { MdSupportAgent } from 'react-icons/md';

const Content = () => {
    return (
        <div className="absolute -bottom-12 sm:-bottom-14 md:-bottom-16 left-0 right-0 mx-auto w-11/12 sm:w-3/4 h-auto border-2 border-gray-400 p-4 sm:p-6 bg-white flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 md:space-x-4">
            {/* Free Shipping */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4">
                <FaShippingFast size="2.5em" className="sm:w-[3em] sm:h-[3em] text-orange-500" />
                <div>
                    <h1 className="font-bold text-base sm:text-lg md:text-xl">Free Shipping Deals</h1>
                    <p className="font-light text-gray-800 text-sm sm:text-base">Redeem free shipping deals</p>
                </div>
            </div>

            {/* Flexible Customer Reach */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4">
                <LuBicepsFlexed size="2.5em" className="sm:w-[3em] sm:h-[3em] text-orange-500" />
                <div>
                    <h1 className="font-bold text-base sm:text-lg md:text-xl">Flexible Customer Reach</h1>
                    <p className="font-light text-gray-800 text-sm sm:text-base">Able to chat with the supplier</p>
                </div>
            </div>

            {/* 24x7 Support */}
            <div className="flex justify-center items-center space-x-3 sm:space-x-4">
                <MdSupportAgent size="2.5em" className="sm:w-[3em] sm:h-[3em] text-orange-500" />
                <div>
                    <h1 className="font-bold text-base sm:text-lg md:text-xl">24x7 Support</h1>
                    <p className="font-light text-gray-800 text-sm sm:text-base">We support online transactions</p>
                </div>
            </div>
        </div>
    );
};

export default Content;
