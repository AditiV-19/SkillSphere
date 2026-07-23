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
      if (!userId) {
        console.warn("Socket connection attempted without a valid userId");
        return;
      }
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

        const message = await Message.create({
          conversation: conversationId,
          sender,
          receiver,
          text,
          fileUrl,
          fileType,
          fileName,
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: text,
          lastMessageAt: new Date(),
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "username role email")
          .populate("receiver", "username role email");

        io.to(conversationId).emit("receiveMessage", populatedMessage);

        await sendNotification({
          recipient: receiver,
          sender,
          type: "MESSAGE",
          title: "New Message",
          message: `${populatedMessage.sender.username} sent you a message.`,
          link: `/chats/${conversationId}`,
          sendEmail: false,
        });
      } catch (err) {
        console.error(err);
      }
    });

    /**
     * Reader has viewed messages in a conversation — tell the sender
     * so their bubble can flip to double-tick without a refresh.
     */
    socket.on("markAsRead", ({ conversationId, readerId }) => {
      if (!conversationId) return;
      // Broadcast to everyone else in the room (the sender)
      socket.to(conversationId).emit("messagesRead", {
        conversationId,
        readerId,
      });
    });

    /**
     * ---------- VIDEO CALL SIGNALING (Module 6) ----------
     * WebRTC needs a signaling channel to exchange SDP offers/answers
     * and ICE candidates. Media itself flows peer-to-peer, not through
     * this server.
     */

    // Caller starts a call
    socket.on(
      "call:initiate",
      async ({ toUserId, fromUser, conversationId, offer }) => {
        const targetSocketId = getUserSocket(toUserId?.toString());

        if (!targetSocketId) {
          socket.emit("call:unavailable", { toUserId });
          return;
        }

        io.to(targetSocketId).emit("call:incoming", {
          fromUser,
          conversationId,
          offer,
        });

        // Reuse existing notification pipeline for missed-call visibility
        try {
          await sendNotification({
            recipient: toUserId,
            sender: fromUser?._id,
            type: "CALL",
            title: "Incoming Video Call",
            message: `${fromUser?.username} is calling you.`,
            link: `/chats/${conversationId}`,
            sendEmail: false,
          });
        } catch (err) {
          console.error("Call notification failed:", err);
        }
      },
    );

    // Callee sends back an answer
    socket.on("call:answer", ({ toUserId, answer }) => {
      const targetSocketId = getUserSocket(toUserId?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:answer", { answer });
      }
    });

    // Callee rejects
    socket.on("call:reject", ({ toUserId }) => {
      const targetSocketId = getUserSocket(toUserId?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:rejected");
      }
    });

    // Either side trickles ICE candidates
    socket.on("call:ice-candidate", ({ toUserId, candidate }) => {
      const targetSocketId = getUserSocket(toUserId?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ice-candidate", { candidate });
      }
    });

    // Either side ends the call
    socket.on("call:end", ({ toUserId }) => {
      const targetSocketId = getUserSocket(toUserId?.toString());
      if (targetSocketId) {
        io.to(targetSocketId).emit("call:ended");
      }
    });

    /**
     * Disconnect
     */
    socket.on("disconnect", () => {
      // If a call was active when this socket drops, tell the other side
      if (socket.userId) {
        io.emit("call:peer-disconnected", { userId: socket.userId });
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
