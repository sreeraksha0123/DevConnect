import { Message } from "../models/messageModel.js";

export const getMessagesWithUser = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    }).sort({ createdAt: 1 });

    res.json({ messages });
  } catch (err) {
    console.error("GetMessages error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createMessage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!receiverId || !content) {
      return res.status(400).json({ message: "receiverId and content are required" });
    }

    const message = await Message.create({
      sender: userId,
      receiver: receiverId,
      content,
    });

    res.status(201).json({ message });
  } catch (err) {
    console.error("CreateMessage error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
