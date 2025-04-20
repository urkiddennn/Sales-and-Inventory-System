
import { Context } from 'hono';
import { Order } from '../model/Order';
import { Product } from '../model/Product';

export const createOrder = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { products } = await c.req.json();

  let total = 0;
  const orderProducts = await Promise.all(products.map(async (item: any) => {
    const product = await Product.findById(item.productId);
    if (!product || product.stock < item.quantity) {
      throw new Error('Invalid product or insufficient stock');
    }
    const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    total += price * item.quantity;
    return { product: product._id, quantity: item.quantity, price };
  }));

  const order = new Order({ user: userId, products: orderProducts, total });
  await order.save();
  return c.json(order);
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
