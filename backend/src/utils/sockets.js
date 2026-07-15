import { Server } from "socket.io";

import { Message } from "../models/chat.model.js";
import { Conversation } from "../models/chat.model.js";
import { sendNotification } from "../services/notification.services.js";

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
      onlineUsers.set(userId.toString(), socket.id);

      socket.userId = userId.toString();

      io.emit("onlineUsers", [...onlineUsers.keys()]);

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
        const {
          conversationId,
          sender,
          receiver,
          text,
          fileUrl,
          fileName,
          fileType,
        } = data;

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

        await sendNotification({
          recipient: receiver,
          sender,
          type: "MESSAGE",
          title: "New Message",
          message: `${populatedMessage.sender.firstname} sent you a message.`,
          link: `/messages/${conversationId}`,
          sendEmail: false,
        });
      } catch (err) {
        console.error(err);
      }
    });

    /**
     * Disconnect
     */
    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
      }

      io.emit("onlineUsers", [...onlineUsers.keys()]);

      console.log(socket.id, "Disconnected");
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
      console.log(`${socket.id} left ${conversationId}`);
    });

    socket.on("typing", ({ conversationId, userId }) => {
      socket.to(conversationId).emit("userTyping", { conversationId, userId });
    });

    socket.on("stopTyping", ({ conversationId, userId }) => {
      socket
        .to(conversationId)
        .emit("userStoppedTyping", { conversationId, userId });
    });
  });

  return io;
};

export const getIO = () => io;

export const getUserSocket = (userId) => {
  return onlineUsers.get(userId);
};
