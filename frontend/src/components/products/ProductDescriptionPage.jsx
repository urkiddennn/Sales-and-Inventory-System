"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { message } from "antd"
import { fetchProductById, addComment, getProductComments } from "../../api"
import { addToCart } from "../../api"
import { useCart } from "../../components/cart/CartContext"
import { ArrowLeftOutlined, ShoppingCartOutlined, StarFilled, StarOutlined } from "@ant-design/icons"
import GreenButton from "./green-button"

const ProductDescriptionPage = () => {
    const { productId } = useParams() // Get productId from URL
    const [product, setProduct] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [rating, setRating] = useState(0) // For user rating input
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const navigate = useNavigate()
    const { addToCart: onAddToCart } = useCart()

    // Fetch product details and comments when component mounts
    useEffect(() => {
        const loadData = async () => {
            if (!productId) {
                message.error("Invalid product ID")
                navigate("/products")
                return
            }
            setLoading(true)
            try {
                const token = localStorage.getItem("token")
                if (!token) {
                    message.warning("Please log in to view product details")
                    navigate("/login")
                    return
                }

                // Fetch product
                const productData = await fetchProductById(token, productId)
                setProduct(productData)

                // Fetch comments
                const commentsData = await getProductComments(token, productId)
                setComments(commentsData || [])
            } catch (error) {
                console.error("Error loading data:", error)
                message.error(error.message || "Failed to load product details or comments")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [productId, navigate])

    // Handle adding a product to the cart
    const handleAddToCart = async () => {
        try {
            const token = localStorage.getItem("token")
            if (!token) {
                message.warning("Please log in to add items to the cart")
                navigate("/login")
                return
            }

            const cartData = { productId, quantity }
            console.log("Adding to cart:", cartData)
            const updatedCart = await addToCart(token, cartData)
            onAddToCart(updatedCart)
            message.success(`Added ${quantity} item(s) to cart successfully!`)
        } catch (error) {
            console.error("Error adding to cart:", error)
            message.error(error.message || "Failed to add item to cart")
        }
    }

    // Handle submitting a new comment
    const handleAddComment = async () => {
        if (!newComment.trim() || rating === 0) {
            message.warning("Please provide a comment and a rating")
            return
        }

        try {
            const token = localStorage.getItem("token")
            if (!token) {
                message.warning("Please log in to add a comment")
                navigate("/login")
                return
            }

            const commentData = {
                productId,
                comment: newComment,
                rating,
            }

            console.log("Submitting comment:", commentData)
            const addedComment = await addComment(token, commentData)
            setComments([...comments, addedComment])
            setNewComment("")
            setRating(0)
            message.success("Comment added successfully!")
        } catch (error) {
            console.error("Error adding comment:", error)
            message.error(error.message || "Failed to add comment")
        }
    }

    // Calculate average rating
    const averageRating =
        comments.length > 0
            ? (comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / comments.length).toFixed(1)
            : "No ratings yet"

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-700"></div>
            </div>
        )
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Product not found</p>
                <GreenButton type="primary" onClick={() => navigate("/products")}>
                    Back to Products
                </GreenButton>
            </div>
        )
    }

    return (
        <div className="px-8 max-w-7xl mx-auto py-8">
            <GreenButton type="default" icon={<ArrowLeftOutlined />} onClick={() => navigate("/products")} className="mb-6">
                Back to Products
            </GreenButton>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Image and Details */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="relative mb-6">
                        <img
                            src={product.imageUrl || "https://via.placeholder.com/300"}
                            alt={product.name || "Product Image"}
                            className="w-full h-80 object-contain rounded-md"
                        />
                        {product.isOnSale && (
                            <span className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg">
                                SALE
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl font-bold mb-4 text-gray-800">{product.name}</h1>

                    <div className="flex items-center mb-4">
                        <div className="flex mr-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-xl ${comments.length > 0 && averageRating >= star ? "text-yellow-400" : "text-gray-300"
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="text-gray-600">
                            {comments.length > 0 ? `${averageRating}/5 (${comments.length} reviews)` : "No reviews yet"}
                        </span>
                    </div>

                    <div className="mb-6">
                        <p className="text-2xl font-bold mb-2">
                            {product.isOnSale && product.salePrice ? (
                                <>
                                    <span className="text-red-600">₱{product.salePrice}</span>
                                    <span className="line-through text-gray-400 text-lg ml-2">₱{product.price}</span>
                                    <span className="text-green-700 text-sm ml-2">
                                        Save ₱{(product.price - product.salePrice).toFixed(2)}
                                    </span>
                                </>
                            ) : (
                                `₱${product.price}`
                            )}
                        </p>
                        <p className="text-gray-600">Category: {product.category}</p>
                        {product.stock > 0 ? (
                            <p className="text-green-700 mt-2">In Stock ({product.stock} available)</p>
                        ) : (
                            <p className="text-red-500 mt-2">Out of Stock</p>
                        )}
                    </div>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-2">Description</h2>
                        <p className="text-gray-600">{product.description || "No description available"}</p>
                    </div>

                    <div className="flex items-center mb-6">
                        <span className="mr-3">Quantity:</span>
                        <div className="flex border border-gray-300 rounded">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 border-r border-gray-300"
                                disabled={quantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-4 py-1">{quantity}</span>
                            <button
                                onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                                className="px-3 py-1 border-l border-gray-300"
                                disabled={quantity >= (product.stock || 10)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <GreenButton
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        onClick={handleAddToCart}
                        className="w-full py-3"
                        size="large"
                        disabled={product.stock <= 0}
                    >
                        {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                    </GreenButton>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-2xl font-semibold mb-6">Customer Reviews</h2>

                    <div className="mb-8 border-b pb-6">
                        <h3 className="text-lg font-medium mb-3">Write a Review</h3>
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-700 mb-3"
                            rows="4"
                        />
                        <div className="mb-3">
                            <p className="mb-2">Your Rating:</p>
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setRating(star)} className="text-2xl mr-1 focus:outline-none">
                                        {rating >= star ? (
                                            <StarFilled className="text-yellow-400" />
                                        ) : (
                                            <StarOutlined className="text-gray-300 hover:text-yellow-400" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <GreenButton type="primary" onClick={handleAddComment}>
                            Submit Review
                        </GreenButton>
                    </div>

                    {comments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-2">No reviews yet</p>
                            <p className="text-gray-600">Be the first to review this product!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-lg font-medium mb-4">{comments.length} Reviews</h3>
                            {comments.map((comment) => (
                                <div key={comment._id} className="border-b pb-4">
                                    <div className="flex justify-between mb-2">
                                        <p className="text-gray-800 font-semibold">{comment.user?.name || "Anonymous"}</p>
                                        <p className="text-gray-400 text-sm">{new Date(comment.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={`text-lg ${i < comment.rating ? "text-yellow-400" : "text-gray-300"}`}>
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600">{comment.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDescriptionPage
