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
  const populatedCart = await Cart.findOne({ user: userId }).populate('items.product');
  return c.json(populatedCart);
};

export const removeFromCart = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId } = await c.req.json();

  const cart = await Cart.findOne({ user: userId });
  if (!cart) return c.json({ error: 'Cart not found' }, 404);

  cart.items.pull({ product: productId });
  await cart.save();
  const populatedCart = await Cart.findOne({ user: userId }).populate('items.product');
  return c.json(populatedCart || { items: [] });
};
export const updateCart = async (c: Context) => {
    try {
      const userId = c.get('jwtPayload').id;
      const { productId, quantity } = await c.req.json();

      if (!productId || typeof quantity !== 'number') {
        return c.json({ error: 'Invalid request: productId and quantity are required' }, 400);
      }

      const cart = await Cart.findOne({ user: userId });
      if (!cart) return c.json({ error: 'Cart not found' }, 404);

      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
      if (itemIndex === -1) {
        return c.json({ error: 'Item not found in cart' }, 404);
      }

      if (quantity <= 0) {
        cart.items.pull({ product: productId });
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      const populatedCart = await Cart.findOne({ user: userId }).populate('items.product');
      return c.json(populatedCart || { items: [] });
    } catch (error) {
      console.error('Error in updateCart:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };
