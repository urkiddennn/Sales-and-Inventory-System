import React, { useState, useEffect } from "react";
import { fetchProducts, addToCart } from "../api/";
import { message } from "antd";

const ProductGrid = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch products when the component mounts
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts(); // No token required for public endpoint
                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format received from server");
                }
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                message.error(error.message || "Failed to load products");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Handle adding a product to the cart
    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                message.error("Please log in to add items to cart");
                return;
            }
            const updatedCart = await addToCart(token, { productId, quantity: 1 });
            onAddToCart(updatedCart);
            message.success("Added to cart");
        } catch (error) {
            console.error("Error adding to cart:", error);
            message.error(error.message || "Failed to add to cart");
        }
    };

    return (
        <section className="py-6">
            <h2 className="text-2xl font-bold mb-4">Our Products</h2>
            {loading ? (
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-800"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center text-gray-500">No products available</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div
                            key={product._id}
                            className="border border-gray-300 rounded-lg p-4 transition duration-300 hover:shadow-lg hover:border-green-800"
                        >
                            <img
                                src={product.imageUrl || "https://via.placeholder.com/150"}
                                alt={product.name || "Product Image"}
                                className="w-full h-40 object-contain mb-4 rounded-md"
                            />
                            <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                            <p className="text-gray-600">
                                {product.isOnSale && product.salePrice ? (
                                    <>
                                        <span className="line-through text-gray-400 mr-2">${product.price}</span>
                                        <span className="text-red-600">${product.salePrice}</span>
                                    </>
                                ) : (
                                    `$${product.price}`
                                )}
                            </p>
                            <button
                                onClick={() => handleAddToCart(product._id)}
                                className="mt-4 w-full bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default ProductGrid;
