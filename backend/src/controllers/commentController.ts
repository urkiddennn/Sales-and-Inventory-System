import { Context } from 'hono';
import { Comment } from '../model/Comment';

export const addComment = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId, content, rating } = await c.req.json();

  if (!productId || !content || !rating) {
    return c.json({ message: 'productId, content, and rating are required' }, 400);
  }

  const comment = new Comment({
    product: productId,
    user: userId,
    content,
    rating,
  });

  await comment.save();
  await comment.populate('user', 'name');
  return c.json(comment);
};

export const getProductComments = async (c: Context) => {
  const { productId } = c.req.param();
  const comments = await Comment.find({ product: productId }).populate('user', 'name');
  return c.json(comments);
};
