import React, { useState, useEffect } from 'react';
import { fetchProducts, addToCart } from '../../api';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../components/cart/CartContext';
import GreenButton from './green-button';
import { ShoppingCartOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]
    const [loading, setLoading] = useState(false);
    const [sortBy, setSortBy] = useState('default');

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

    // Navigate to product description page
    const handleProductClick = (productId) => {
        navigate(`/products/${productId}`);
    };

    // Sort products
    const sortProducts = (products) => {
        let sorted = [...products];
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => {
                    const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
                    const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
                    return priceA - priceB;
                });
                break;
            case 'price-desc':
                sorted.sort((a, b) => {
                    const priceA = a.isOnSale && a.salePrice ? a.salePrice : a.price;
                    const priceB = b.isOnSale && b.salePrice ? b.salePrice : b.price;
                    return priceB - priceA;
                });
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
            default:
                // Keep original order
                break;
        }
        return sorted;
    };

    // Filter products based on category and price range
    const filteredProducts = sortProducts(products.filter((product) => {
        const price = product.isOnSale && product.salePrice ? product.salePrice : (product.price || 0);
        return (
            price >= priceRange[0] &&
            price <= priceRange[1] &&
            (category === 'All' || product.category === category)
        );
    }));

    const categories = ['All', 'Air Conditioner', 'Refrigerator', 'Washing Machine', 'Microwave', 'Stove'];

    return (
        <div className="px-8 max-w-7xl mx-auto py-6">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Home Appliances</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">Categories</h2>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setCategory(cat)}
                                        className={`w-full text-left py-2 px-3 rounded transition-colors ${category === cat
                                                ? 'bg-green-100 text-green-700 font-medium'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                </li>
                            ))}
                        </ul>

                        <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-800">Filter by Price</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Min Price</span>
                                <span>₱{priceRange[0]}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                className="w-full accent-green-700"
                            />

                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>Max Price</span>
                                <span>₱{priceRange[1]}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="20000"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                className="w-full accent-green-700"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="lg:col-span-3">
                    <div className="mb-6">
                        <h1 className='text-green-700 font-medium text-3xl mb-6'>Home Appliances</h1>
                        <p className="text-gray-600 mb-6">
                            Browse our selection of high-quality home appliances for your kitchen and home.
                        </p>
                        <div className='w-full flex flex-col sm:flex-row justify-between mb-6'>
                            <p className="text-gray-600 mb-3 sm:mb-0">
                                Showing {filteredProducts.length} of {products.length} results
                            </p>
                            <div className="flex items-center">
                                <span className="text-gray-600 mr-2">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="border border-gray-300 rounded p-1 focus:outline-none focus:ring-1 focus:ring-green-700"
                                >
                                    <option value="default">Default</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                </select>
                            </div>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center h-40">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-700"></div>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500 mb-4">No products match the selected filters</p>
                                <GreenButton
                                    type="primary"
                                    onClick={() => {
                                        setCategory('All');
                                        setPriceRange([0, 20000]);
                                    }}
                                >
                                    Clear Filters
                                </GreenButton>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="bg-white border border-gray-200 rounded-lg p-4 transition duration-300 hover:shadow-lg hover:border-green-700"
                                    >
                                        <div
                                            className="cursor-pointer"
                                            onClick={() => handleProductClick(product._id)}
                                        >
                                            <div className="relative">
                                                <img
                                                    src={product.imageUrl || "https://via.placeholder.com/150"}
                                                    alt={product.name || "Product Image"}
                                                    className="w-full h-40 object-contain mb-4"
                                                />
                                                {product.isOnSale && (
                                                    <span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                                                        SALE
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                                            <p className="text-gray-600 mb-2">
                                                {product.isOnSale && product.salePrice ? (
                                                    <>
                                                        <span className="line-through text-gray-400 mr-2">₱{product.price}</span>
                                                        <span className="text-red-600 font-medium">₱{product.salePrice}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-medium">₱{product.price}</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                                {product.description || "No description available"}
                                            </p>
                                        </div>
                                        <GreenButton
                                            type="primary"
                                            icon={<ShoppingCartOutlined />}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent triggering the card's onClick
                                                handleAddToCart(product._id);
                                            }}
                                            className="w-full"
                                        >
                                            Add to Cart
                                        </GreenButton>
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
