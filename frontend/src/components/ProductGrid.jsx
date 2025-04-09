import React, { useState, useEffect } from 'react';
import { getProducts, addToCart } from '../api';

const ProductGrid = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const token = localStorage.getItem('token');
                const data = await getProducts(token);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const updatedCart = await addToCart(token, { productId, quantity: 1 });
            onAddToCart(updatedCart);
        } catch (error) {
            console.error('Error adding to cart:', error);
        }
    };

    return (
        <section className="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Products</h2>
            <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                    <div key={product._id} className="border rounded-lg p-4 shadow hover:shadow-lg transition">
                        <img
                            src={product.imageUrl || 'https://via.placeholder.com/150'}
                            alt={product.name}
                            className="w-full h-40 object-cover mb-4"
                        />
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-600">
                            {product.isOnSale && product.salePrice
                                ? `$${product.salePrice}`
                                : `$${product.price}`}
                        </p>
                        <button
                            onClick={() => handleAddToCart(product._id)}
                            className="mt-2 bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default ProductGrid;
