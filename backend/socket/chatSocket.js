import { Message } from "../models/messageModel.js";

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 New client connected:", socket.id);

    // client should emit "join" with their userId
    socket.on("join", (userId) => {
      if (!userId) return;
      socket.join(String(userId));
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on("send_message", async ({ senderId, receiverId, content }) => {
      try {
        if (!senderId || !receiverId || !content) return;

        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          content,
        });

        // emit to receiver room
        io.to(String(receiverId)).emit("receive_message", {
          _id: message._id,
          sender: senderId,
          receiver: receiverId,
          content,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
    });
  });
};
