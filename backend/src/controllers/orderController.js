import { Order } from '../model/Order.js';
import { Product } from '../model/Product.js';
import { User } from '../model/User.js';

export const createOrder = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const { products } = req.body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Products array is required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let total = 0;
        const orderProducts = await Promise.all(products.map(async (item) => {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                throw new Error(`Invalid product or insufficient stock for product ID: ${item.product}`);
            }
            const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
            total += price * item.quantity;
            product.stock -= item.quantity;
            await product.save();
            return { product: product._id, quantity: item.quantity, price };
        }));

        const order = new Order({
            user: userId,
            products: orderProducts,
            shippingAddress: user.address,
            total,
            status: 'pending',
        });

        await order.save();
        res.status(201).json(order);
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
        const orders = await Order.find(query).populate('products.product').populate('user');
        res.json(orders);
    } catch (error) {
        console.error('Error in getOrders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        order.status = status;
        await order.save();
        res.json(order);
    } catch (error) {
        console.error('Error in updateOrderStatus:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        if (order.user.toString() !== userId && role !== 'admin') {
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

        const order = await Order.findById(id).populate('products.product').populate('user');
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
