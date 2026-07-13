import { Server } from "socket.io";

import { Message } from "../models/chat.model.js";
import { Conversation } from "../models/chat.model.js";

let io;

// Stores userId -> socketId
const onlineUsers = new Map();

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    /**
     * Register user after login
     */
    socket.on("registerUser", (userId) => {
      onlineUsers.set(userId, socket.id);

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));

      console.log("Online Users:", Array.from(onlineUsers.keys()));
    });

    /**
     * Join a conversation room
     */
    socket.on("joinConversation", (conversationId) => {
      socket.join(conversationId);
      console.log(`${socket.id} joined ${conversationId}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, sender, receiver, text, fileUrl, fileName, fileType } = data;

        // Save message
        const message = await Message.create({
          conversation: conversationId,
          sender,
          receiver,
          text,
          fileUrl,
          fileType,
          fileName,
        });

        // Update conversation preview
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageAt: new Date(),
        });

        // Populate sender & receiver
        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "firstname lastname profilePicture")
          .populate("receiver", "firstname lastname profilePicture");

        console.log("Sending message to room:", conversationId);

        // Emit to everyone in this conversation (sender included)
        io.to(conversationId).emit("receiveMessage", populatedMessage);
      } catch (err) {
        console.error(err);
      }
    });

    /**
     * Disconnect
     */
    socket.on("disconnect", () => {
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));

      console.log("Disconnected:", socket.id);
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.id} left ${conversationId}`);
    });

    socket.on("typing", ({ conversationId, userId }) => {
    socket.to(conversationId).emit("userTyping", { conversationId, userId });
});

socket.on("stopTyping", ({ conversationId, userId }) => {
  socket.to(conversationId).emit("userStoppedTyping", { conversationId, userId });
});

  });

  return io;
};

export const getIO = () => io;
