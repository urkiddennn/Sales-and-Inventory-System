import { Cart } from '../model/Cart.js';

export const getCart = async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (error) {
    console.error('Error in getCart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { productId, quantity } = req.body;

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
    res.json(populatedCart);
  } catch (error) {
    console.error('Error in addToCart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items.pull({ product: productId });
    await cart.save();
    const populatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(populatedCart || { items: [] });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateCart = async (req, res) => {
  try {
    const userId = req.jwtPayload.id;
    const { productId, quantity } = req.body;

    if (!productId || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Invalid request: productId and quantity are required' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.pull({ product: productId });
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    const populatedCart = await Cart.findOne({ user: userId }).populate('items.product');
    res.json(populatedCart || { items: [] });
  } catch (error) {
    console.error('Error in updateCart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
