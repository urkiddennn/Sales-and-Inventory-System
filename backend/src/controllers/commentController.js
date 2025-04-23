import { Comment } from '../model/Comment.js';

export const addComment = async (req, res) => {
    const userId = req.jwtPayload.id;
    const { productId, content, rating } = req.body;

    if (!productId || !content || !rating) {
        return res.status(400).json({ message: 'productId, content, and rating are required' });
    }

    try {
        const comment = new Comment({
            product: productId,
            user: userId,
            content,
            rating,
        });

        await comment.save();
        await comment.populate('user', 'name profileUrl');
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment' });
    }
};

export const getProductComments = async (req, res) => {
    const { productId } = req.params;

    try {
        const comments = await Comment.find({ product: productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find()
            .populate('user', 'name profileUrl')
            .populate('product', 'name')
            .sort({ createdAt: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch comments' });
    }
};
