import React from 'react';

const FeaturedSection = () => {
    return (
        <section className="py-6">
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 bg-gray-200 p-4 ">
                    <img src="https://via.placeholder.com/300" alt="Featured Product" className="w-full h-48 object-cover mb-4" />
                    <p className="text-gray-700">Free Shipping</p>
                    <p className="text-gray-500 text-sm">Just some sample text here</p>
                </div>
                <div className="flex-1 bg-gray-200 p-4 ">
                    <img src="https://via.placeholder.com/300" alt="Featured Product" className="w-full h-48 object-cover mb-4" />
                    <p className="text-gray-700">Free Shipping</p>
                    <p className="text-gray-500 text-sm">Just some sample text here</p>
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
