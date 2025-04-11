import React, { useState, useEffect } from 'react';
import { fetchProducts, addToCart } from '../../api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/cart/CartContext';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate(); // For navigation
    const { addToCart: onAddToCart } = useCart(); // Access global cart state

    // Fetch products when the component mounts
    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            try {
                const data = await fetchProducts();
                console.log("Fetched Products:", data);
                if (!Array.isArray(data)) {
                    throw new Error("Invalid data format received from server");
                }
                setProducts(data || []);
            } catch (error) {
                console.error("Error fetching products:", error);
                message.error(error.message || "Failed to load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Handle adding a product to the cart
    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning("Please log in to add items to the cart");
                return navigate('/login'); // Redirect to login page
            }

            // Add product to cart
            const cartData = { productId, quantity: 1 };
            console.log("Adding to cart:", cartData);

            const updatedCart = await addToCart(token, cartData);
            console.log("Updated Cart:", updatedCart);

            onAddToCart(updatedCart); // Update global cart state
            message.success("Added to cart successfully!");
        } catch (error) {
            console.error('Error adding to cart:', error);
            message.error(error.message || "Failed to add item to cart. Please try again later.");
        }
    };

    // Filter products based on category and price range
    const filteredProducts = products.filter((product) => {
        const price = product.isOnSale && product.salePrice ? product.salePrice : (product.price || 0);
        return (
            price >= priceRange[0] &&
            price <= priceRange[1] &&
            (category === 'All' || product.category === category)
        );
    });

    const categories = ['All', 'Air Conditioner', 'Refrigerator', 'Washing Machine', 'Microwave', 'Stove'];

    return (
        <div className="px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Home Appliances</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="h-full bg-white border-r border-gray-500 p-6">
                        <h2 className="text-xl font-semibold mb-4">Categories</h2>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setCategory(cat)}
                                        className={`w-full text-left py-2 px-3 rounded ${category === cat ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <h2 className="text-xl font-semibold mt-6 mb-4">Filter by Price</h2>
                        <div className="space-y-2">
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full"
                            />
                            <input
                                type="range"
                                min="0"
                                max="20000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full"
                            />
                            <div className="flex justify-between text-gray-600">
                                <span>₱{priceRange[0]}</span>
                                <span>₱{priceRange[1]}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    <div className="mb-6 h-full w-full">
                        <h1 className='text-green-700 font-medium text-3xl mb-10'>Home Appliances</h1>
                        <p className="text-gray-600">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                        <div className='w-full flex justify-between mb-3'>
                            <p className="text-gray-600 mt-2">
                                Showing {filteredProducts.length} of {products.length} results
                            </p>
                            <p className="text-gray-600 mt-2">
                                Sort by
                            </p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-800"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center text-gray-500">No products match the selected filters</div>
                        ) : (
                            <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
