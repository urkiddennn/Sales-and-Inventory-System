import { Order } from '../model/Order.js';
import { Product } from '../model/Product.js';
import { User } from '../model/User.js';
import mongoose from 'mongoose';

export const createOrder = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const { products, shippingAddress } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required and cannot be empty' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use req.body.shippingAddress if provided, otherwise fall back to user.address
        const finalShippingAddress = shippingAddress || user.address;
        if (
            !finalShippingAddress ||
            !finalShippingAddress.fullName ||
            !finalShippingAddress.street ||
            !finalShippingAddress.city ||
            !finalShippingAddress.state ||
            !finalShippingAddress.zipCode
        ) {
            return res.status(400).json({
                message: 'Shipping address must include fullName, street, city, state, and zipCode',
            });
        }

        let total = 0;
        const orderProducts = await Promise.all(
            products.map(async (item) => {
                const product = await Product.findById(item.product);
                if (!product || product.stock < item.quantity) {
                    throw new Error(
                        `Invalid product or insufficient stock for product ID: ${item.product}`
                    );
                }
                const price =
                    product.isOnSale && product.salePrice
                        ? product.salePrice
                        : product.price;
                total += price * item.quantity;
                product.stock -= item.quantity;
                await product.save();
                return { product: product._id, quantity: item.quantity, price };
            })
        );

        const shippingCost = 5.99;
        const tax = total * 0.08;
        total = parseFloat((total + shippingCost + tax).toFixed(2));

        const order = new Order({
            user: userId,
            products: orderProducts,
            shippingAddress: finalShippingAddress,
            total,
            status: 'pending',
        });

        await order.save();
        const populatedOrder = await Order.findById(order._id)
            .populate('products.product', 'name')
            .populate('user', 'name email');
        res.status(201).json(populatedOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;
        const query = role === 'admin' ? {} : { user: userId };
        const orders = await Order.find(query)
            .populate('products.product', 'name imageUrl')
            .populate('user', 'name email');

        // Filter out invalid orders and products
        const cleanedOrders = orders
            .filter(order => {
                if (!order.user) {
                    console.warn(`Order ${order._id} has invalid user reference`);
                    return false;
                }
                return true;
            })
            .map(order => {
                const validProducts = order.products.filter(item => item.product !== null);
                if (validProducts.length !== order.products.length) {
                    console.warn(`Order ${order._id} has invalid product references:`, {
                        invalidProducts: order.products.filter(item => item.product === null)
                    });
                }
                return { ...order.toObject(), products: validProducts };
            });

        console.log('Fetched orders:', cleanedOrders);
        res.json(cleanedOrders);
    } catch (error) {
        console.error('Error in getOrders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate ObjectId
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        // Find order without population to avoid reference issues
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update status
        order.status = status;
        await order.save();

        // Populate for response
        const populatedOrder = await Order.findById(id)
            .populate('products.product', 'name')
            .populate('user', 'name email');
        if (!populatedOrder) {
            return res.status(404).json({ error: 'Order not found after update' });
        }

        res.json(populatedOrder);
    } catch (error) {
        console.error('Error in updateOrderStatus:', {
            error: error.message,
            stack: error.stack,
            orderId: req.params.id,
            status: req.body.status
        });
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(id)
            .populate('products.product', 'name')
            .populate('user', 'name email');
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.user._id.toString() !== userId && role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to cancel this order' });
        }

        if (order.status === 'cancelled') {
            return res.status(400).json({ error: 'Order is already cancelled' });
        }

        order.status = 'cancelled';
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error in cancelOrder:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(id)
            .populate('products.product', 'name imageUrl')
            .populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user._id.toString() !== userId && role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to view this order' });
        }

        res.json(order);
    } catch (error) {
        console.error('Error fetching order by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ error: 'Invalid order ID' });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.user.toString() !== userId && role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized to delete this order' });
        }

        await Order.findByIdAndDelete(id);
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
