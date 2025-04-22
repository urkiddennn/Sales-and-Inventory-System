
import { Context } from 'hono';
import { Order } from '../model/Order';
import { Product } from '../model/Product';
import {User} from "../model/User"



export const createOrder = async (c: Context) => {
    try {
        const userId = c.get('jwtPayload').id;
        const body = await c.req.json();
        console.log("Received order data:", body);
        const { products } = body;

        if (!products || !Array.isArray(products) || products.length === 0) {
            return c.json({ message: "Products array is required" }, 400);
        }

        const user = await User.findById(userId);
        if (!user) {
            return c.json({ message: "User not found" }, 404);
        }

        let total = 0;
        const orderProducts = await Promise.all(products.map(async (item: any) => {
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
            shippingAddress: user.address, // Use user’s address
            total,
            status: 'pending',
        });

        await order.save();
        return c.json(order, 201);
    } catch (error: any) {
        console.error("Error creating order:", error);
        return c.json({ message: error.message || "Internal server error" }, 500);
    }
};

export const getOrders = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const role = c.get('jwtPayload').role;
  const query = role === 'admin' ? {} : { user: userId };
  const orders = await Order.find(query).populate('products.product').populate('user');
  return c.json(orders);
};

export const updateOrderStatus = async (c: Context) => {
  const { id } = c.req.param();
  const { status } = await c.req.json();

  const order = await Order.findById(id);
  if (!order) return c.json({ error: 'Order not found' }, 404);

  order.status = status;
  await order.save();
  return c.json(order);
};

export const cancelOrder = async (c: Context) => {
  const { id } = c.req.param();
  const userId = c.get('jwtPayload').id;
  const role = c.get('jwtPayload').role;

  const order = await Order.findById(id);
  if (!order) return c.json({ error: 'Order not found' }, 404);

  // Only allow cancellation by the order's owner or an admin
  if (order.user.toString() !== userId && role !== 'admin') {
    return c.json({ error: 'Unauthorized to cancel this order' }, 403);
  }

  if (order.status === 'cancelled') {
    return c.json({ error: 'Order is already cancelled' }, 400);
  }

  order.status = 'cancelled';
  await order.save();
  return c.json(order);
};
export const getOrderById = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('jwtPayload').id;
        const role = c.get('jwtPayload').role;

        const order = await Order.findById(id).populate('products.product').populate('user');
        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        // Only allow access to the order's owner or an admin
        if (order.user._id.toString() !== userId && role !== 'admin') {
            return c.json({ error: 'Unauthorized to view this order' }, 403);
        }

        return c.json(order);
    } catch (error: unknown) {
        console.error('Error fetching order by ID:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
};
export const deleteOrder = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const userId = c.get('jwtPayload').id;
        const role = c.get('jwtPayload').role;

        const order = await Order.findById(id);
        if (!order) {
            return c.json({ error: 'Order not found' }, 404);
        }

        // Only allow deletion by the order's owner or an admin
        if (order.user.toString() !== userId && role !== 'admin') {
            return c.json({ error: 'Unauthorized to delete this order' }, 403);
        }

        await Order.findByIdAndDelete(id);
        return c.json({ message: 'Order deleted successfully' });
    } catch (error: unknown) {
        console.error('Error deleting order:', error);
        return c.json({ error: 'Internal server error' }, 500);
    }
};
