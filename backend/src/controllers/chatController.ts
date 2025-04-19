// src/controllers/chatController.ts
import { Context } from "hono";
import { Chat } from "../model/Chat";
import { User } from "../model/User";

export const getChats = async (c: Context) => {
  try {
    const userId = c.get("jwtPayload").id;
    // Fetch chats where user is a participant
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email")
      .populate("messages.sender", "name email");
    return c.json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const sendMessage = async (c: Context) => {
  try {
    const userId = c.get("jwtPayload").id;
    const role = c.get("jwtPayload").role;
    const { recipientId, content } = await c.req.json();

    // Enforce non-admins can only chat with admin
    if (role !== "admin" && recipientId) {
      const admin = await User.findOne({ role: "admin" });
      if (!admin || recipientId !== admin._id.toString()) {
        return c.json({ error: "You can only chat with the admin" }, 403);
      }
    }

    // Find or create user-admin chat
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipientId] },
    });
    if (!chat) {
      chat = new Chat({ participants: [userId, recipientId], messages: [] });
    }

    chat.messages.push({ sender: userId, content });
    await chat.save();
    // Populate sender details in the response
    await (await chat.populate("participants", "name email")).populate("messages.sender", "name email");
    return c.json(chat);
  } catch (error) {
    console.error("Send message error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
