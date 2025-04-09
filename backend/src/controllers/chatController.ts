// src/controllers/chatController.ts
import { Context } from 'hono';
import { Chat } from '../model/Chat';

export const getChats = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const chats = await Chat.find({ participants: userId }).populate('participants');
  return c.json(chats);
};

export const sendMessage = async (c: Context) => {
  const userId = c.get('jwtPayload').id;
  const { recipientId, content } = await c.req.json();

  let chat = await Chat.findOne({
    participants: { $all: [userId, recipientId] }
  });

  if (!chat) {
    chat = new Chat({ participants: [userId, recipientId], messages: [] });
  }

  chat.messages.push({ sender: userId, content });
  await chat.save();
  return c.json(chat);
};
