import { Context } from 'hono';
import { Cart } from '../model/Cart';

export const getCart = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  return c.json(cart || { items: [] });
};

export const addToCart = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId, quantity } = await c.req.json();

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  }

  const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  return c.json(cart);
};

export const removeFromCart = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId } = await c.req.json();

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return c.json({ error: 'Cart not found' }, 404);

  // Use Mongoose's pull method for type-safe removal
  cart.items.pull({ product: productId });

  await cart.save();
  return c.json(cart);
};
