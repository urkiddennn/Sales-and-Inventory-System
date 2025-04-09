// src/controllers/commentController.ts
import { Context } from 'hono';
import { Comment } from '../model/Comment';

export const addComment = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { productId, content } = await c.req.json();

  const comment = new Comment({
    product: productId,
    user: userId,
    content
  });

  await comment.save();
  return c.json(comment);
};

export const getProductComments = async (c: Context) => {
  const { productId } = c.req.param();
  const comments = await Comment.find({ product: productId }).populate('user', 'name');
  return c.json(comments);
};
