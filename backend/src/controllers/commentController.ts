import { Context } from 'hono';
import { Comment } from '../model/Comment';

export const addComment = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId, content, rating } = await c.req.json();

  if (!productId || !content || !rating) {
    return c.json({ message: 'productId, content, and rating are required' }, 400);
  }

  try {
    const comment = new Comment({
      product: productId,
      user: userId,
      content,
      rating,
    });

    await comment.save();
    await comment.populate('user', 'name');
    return c.json(comment);
  } catch (error) {
    return c.json({ message: 'Failed to add comment' }, 500);
  }
};

export const getProductComments = async (c: Context) => {
  const { productId } = c.req.param();

  try {
    const comments = await Comment.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    return c.json(comments);
  } catch (error) {
    return c.json({ message: 'Failed to fetch comments' }, 500);
  }
};

export const getAllComments = async (c: Context) => {
  try {
    const comments = await Comment.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    return c.json(comments);
  } catch (error) {
    return c.json({ message: 'Failed to fetch comments' }, 500);
  }
};
