import {Conversation} from "../models/chat.model.js"
import {Message} from "../models/chat.model.js";

export const startConversation = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot message yourself.",
      });
    }

    let conversation = await Conversation.findOne({
      participants: {
        $all: [senderId, receiverId],
      },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    conversation = await Conversation.findById(conversation._id)
      .populate("participants", "firstname profilePicture role");

    res.status(200).json({
      success: true,
      conversation,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to start conversation",
    });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "firstname email profilePicture")
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({
      conversation: conversationId,
    })
      .populate("sender", "firstname profilePicture")
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};