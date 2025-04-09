import React, { useState, useEffect } from 'react';
import { getProducts } from '../../api';
import { FaStar } from 'react-icons/fa';

const ProductsPage = ({ onAddToCart }) => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('All');
    const [priceRange, setPriceRange] = useState([0, 1000]); // [min, max]

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

    const filteredProducts = products.filter((product) => {
        const price = product.isOnSale ? product.salePrice : product.price;
        const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
        const inCategory = category === 'All' || product.category === category;
        return inPriceRange && inCategory;
    });

    const categories = ['All', 'Air Conditioner', 'Refrigerator', 'Washing Machine', 'Microwave', 'Stove'];

    return (
        <div className="px-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Home Appliances</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white border-r border-gray-500  p-6">
                        <h2 className="text-xl font-semibold mb-4">Categories</h2>
                        <ul className="space-y-2">
                            {categories.map((cat) => (
                                <li key={cat}>
                                    <button
                                        onClick={() => setCategory(cat)}
                                        className={`w-full text-left py-2 px-3 rounded ${category === cat ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'
                                            }`}
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
                                max="1000"
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
                        <h1 className='text-green-700 font-medium text-3xl mb-10'>Home Applicencies</h1>
                        <p className="text-gray-600">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi auctor, nisl ac ultricies consectetur,
                            felis metus bibendum lorem, in placerat quam elit at risus. In hac habitasse platea dictumst.
                        </p>
                        <div className='w-full flex justify-between'>
                            <p className="text-gray-600 mt-2">
                                Showing {filteredProducts.length} of {products.length} results
                            </p>
                            <p className="text-gray-600 mt-2">
                                Sort by
                            </p>
                        </div>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProducts.map((product) => (
                            <div
                                key={product._id}
                                className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow"
                            >
                                <img
                                    src={product.imageUrl || 'https://via.placeholder.com/150'}
                                    alt={product.name}
                                    className="w-full h-40 object-cover rounded-md mb-4"
                                />
                                <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
                                <p className="text-gray-600">
                                    ₱{product.isOnSale ? product.salePrice : product.price}
                                </p>
                                <div className="flex items-center mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className="text-yellow-400" />
                                    ))}
                                    <span className="ml-2 text-gray-600">(5.0)</span>
                                </div>
                                <button
                                    onClick={() => handleAddToCart(product._id)}
                                    className="w-full bg-green-800 text-white py-2 rounded mt-4 hover:bg-green-700"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductsPage;
