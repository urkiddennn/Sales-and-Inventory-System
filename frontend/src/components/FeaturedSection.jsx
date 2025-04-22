import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api'; // Adjust the path to your api.js file

const FeaturedSection = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                // Limit to 2 products for the featured section
                setProducts(data.slice(0, 2));
            } catch (err) {
                console.error('Failed to fetch products:', err.message);
                // Fallback to empty array to avoid breaking the UI
                setProducts([]);
            }
        };
        loadProducts();
    }, []);

    return (
        <section className="">
            <div className="flex flex-col md:flex-row gap-6">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product._id} className="flex-1 border border-gray-300 p-4">
                            <div
                                className="w-full h-48 bg-cover bg-center mb-4"
                                style={{
                                    backgroundImage: `url(${product.imageUrl || 'https://via.placeholder.com/300'})`,
                                    backgroundSize: "contain",
                                    backgroundRepeat: "no-repeat"
                                }}
                            ></div>
                            <p className="text-gray-700">{product.name}</p>
                            <p className="text-gray-500 text-sm">
                                {product.isOnSale ? 'Free Shipping on Sale!' : 'Free Shipping'}
                            </p>
                        </div>
                    ))
                ) : (
                    // Fallback to original placeholders with background images
                    <>
                        <div className="flex-1 bg-gray-200 p-4">
                            <div
                                className="w-full h-48 bg-cover bg-center mb-4"
                                style={{ backgroundImage: `url(https://via.placeholder.com/300)` }}
                            ></div>
                            <p className="text-gray-700">Free Shipping</p>
                            <p className="text-gray-500 text-sm">Just some sample text here</p>
                        </div>
                        <div className="flex-1 bg-gray-200 p-4">
                            <div
                                className="w-full h-48 bg-cover bg-center mb-4"
                                style={{ backgroundImage: `url(https://via.placeholder.com/300)` }}
                            ></div>
                            <p className="text-gray-700">Free Shipping</p>
                            <p className="text-gray-500 text-sm">Just some sample text here</p>
                        </div>
                    </>
                )}
            </div>
        </section>
    );
};

export default FeaturedSection;
