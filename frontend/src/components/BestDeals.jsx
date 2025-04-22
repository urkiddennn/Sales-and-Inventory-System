import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api'; // Adjust the path to your api.js file
import { Link } from 'react-router-dom';
const BestDeals = () => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const loadSaleProduct = async () => {
            try {
                const data = await fetchProducts();
                // Select the first product that is on sale
                const saleProduct = data.find((p) => p.isOnSale);
                setProduct(saleProduct || null);
            } catch (err) {
                console.error('Failed to fetch sale products:', err.message);
                setProduct(null);
            }
        };
        loadSaleProduct();
    }, []);

    // Calculate discount percentage if product exists and has salePrice
    const discountPercentage = product?.price && product?.salePrice
        ? Math.round(((product.price - product.salePrice) / product.price) * 100)
        : 30; // Fallback to 30% if no product

    return (
        <div className="w-full h-96 md:h-80 flex flex-col-reverse justify-center items-center md:flex-row">
            <div className="w-full md:w-1/2 h-full flex gap-3 flex-col justify-center items-start">
                <p className="font-semibold text-gray-400">Brand deal</p>
                <h1 className="text-2xl text-gray-800">
                    {product
                        ? `Save up to ${discountPercentage}% on ${product.name}`
                        : 'Save up to 30% on select Samsung CCTV Camera'}
                </h1>
                <p className="text-gray-400 font-thin">
                    {product ? 'Exclusive sale deal' : 'Tortor purus et quis aenean tempus tellus fames. deal'}
                </p>

                <a className="font-semibold text-blue-500">Shop Now</a>
            </div>
            <div
                className="w-full md:w-1/2 h-full bg-cover bg-center text-b"
                style={{
                    backgroundImage: `url(${product?.imageUrl || 'https://via.placeholder.com/600x400'
                        })`,
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat"
                }}
            ></div>
        </div>
    );
};

export default BestDeals;
