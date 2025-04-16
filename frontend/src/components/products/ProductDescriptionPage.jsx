import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { fetchProductById, addComment, getProductComments } from '../../api';
import { useCart } from '../../components/cart/CartContext';

const ProductDescriptionPage = () => {
    const { productId } = useParams(); // Get productId from URL
    const [product, setProduct] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [rating, setRating] = useState(0); // For user rating input
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToCart: onAddToCart } = useCart();

    // Fetch product details and comments when component mounts
    useEffect(() => {
        const loadData = async () => {
            if (!productId) {
                message.error('Invalid product ID');
                navigate('/products');
                return;
            }
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    message.warning('Please log in to view product details');
                    navigate('/login');
                    return;
                }

                // Fetch product
                const productData = await fetchProductById(token, productId);
                setProduct(productData);

                // Fetch comments
                const commentsData = await getProductComments(token, productId);
                setComments(commentsData || []);
            } catch (error) {
                console.error('Error loading data:', error);
                message.error(error.message || 'Failed to load product details or comments');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [productId, navigate]);

    // Handle adding a product to the cart
    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning('Please log in to add items to the cart');
                navigate('/login');
                return;
            }

            const cartData = { productId, quantity: 1 };
            const updatedCart = await addToCart(token, cartData);
            onAddToCart(updatedCart);
            message.success('Added to cart successfully!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            message.error(error.message || 'Failed to add item to cart');
        }
    };

    // Handle submitting a new comment
    const handleAddComment = async () => {
        if (!newComment.trim() || rating === 0) {
            message.warning('Please provide a comment and a rating');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                message.warning('Please log in to add a comment');
                navigate('/login');
                return;
            }

            const commentData = {
                productId,
                comment: newComment,
                rating,
            };

            console.log('Submitting comment:', commentData);
            const addedComment = await addComment(token, commentData);
            setComments([...comments, addedComment]);
            setNewComment('');
            setRating(0);
            message.success('Comment added successfully!');
        } catch (error) {
            console.error('Error adding comment:', error);
            message.error(error.message || 'Failed to add comment');
        }
    };

    // Calculate average rating
    const averageRating = comments.length > 0
        ? (comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / comments.length).toFixed(1)
        : 'No ratings yet';

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-800"></div>
            </div>
        );
    }

    if (!product) {
        return <div className="text-center text-gray-500">Product not found</div>;
    }

    return (
        <div className="px-8 max-w-7xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">{product.name}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image and Details */}
                <div>
                    <img
                        src={product.imageUrl || 'https://via.placeholder.com/300'}
                        alt={product.name || 'Product Image'}
                        className="w-full h-80 object-contain rounded-md mb-4"
                    />
                    <p className="text-gray-600 mb-4">{product.description || 'No description available'}</p>
                    <p className="text-gray-600 mb-4">
                        {product.isOnSale && product.salePrice ? (
                            <>
                                <span className="line-through text-gray-400 mr-2">₱{product.price}</span>
                                <span className="text-red-600">₱{product.salePrice}</span>
                            </>
                        ) : (
                            `₱${product.price}`
                        )}
                    </p>
                    <p className="text-gray-600 mb-4">Category: {product.category}</p>
                    <p className="text-gray-600 mb-4">Average Rating: {averageRating} / 5</p>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                    >
                        Add to Cart
                    </button>
                </div>

                {/* Comments Section */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4">Comments & Ratings</h2>
                    <div className="mb-6">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write your comment here..."
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-800"
                            rows="4"
                        />
                        <div className="mt-2">
                            <label className="mr-2">Rating:</label>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`text-2xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleAddComment}
                            className="mt-2 bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
                        >
                            Submit Comment
                        </button>
                    </div>

                    {comments.length === 0 ? (
                        <p className="text-gray-500">No comments yet</p>
                    ) : (
                        <div className="space-y-4">
                            {comments.map((comment) => (
                                <div key={comment._id} className="border-b pb-4">
                                    <p className="text-gray-800 font-semibold">{comment.user?.name || 'Anonymous'}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-xl ${i < comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600">{comment.content}</p>
                                    <p className="text-gray-400 text-sm">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDescriptionPage;
