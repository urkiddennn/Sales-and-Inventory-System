import { Chat } from '../model/Chat.js';
import { User } from '../model/User.js';

export const getChats = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const chats = await Chat.find({ participants: userId })
            .populate('participants', 'name email')
            .populate('messages.sender', 'name email');
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const userId = req.jwtPayload.id;
        const role = req.jwtPayload.role;
        const { recipientId, content } = req.body;

        if (role !== 'admin' && recipientId) {
            const admin = await User.findOne({ role: 'admin' });
            if (!admin || recipientId !== admin._id.toString()) {
                return res.status(403).json({ error: 'You can only chat with the admin' });
            }
        }

        let chat = await Chat.findOne({
            participants: { $all: [userId, recipientId] },
        });
        if (!chat) {
            chat = new Chat({ participants: [userId, recipientId], messages: [] });
        }

        chat.messages.push({ sender: userId, content });
        await chat.save();
        await (await chat.populate('participants', 'name email')).populate('messages.sender', 'name email');
        res.json(chat);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
