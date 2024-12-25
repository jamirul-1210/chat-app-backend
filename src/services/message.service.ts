import mongoose from "mongoose";
import { IMessage, Message } from "../models/message.model";

/**
 * Send a new message.
 */
export const sendMessage = async (data: Partial<IMessage|any>): Promise<IMessage> => {
  return Message.create(data);
};

/**
 * Get all messages in a chat.
 */
export const getMessagesByChat = async (chatId: string): Promise<IMessage[]> => {
  return Message.find({ chat: chatId })
    .populate("sender", "-password") 
    .exec();
};

export const getMessagesByChatId = async (chatId: string, userId: string): Promise<any> => {
  try {
    const messages = await Message.aggregate([
      {
        $match: { chatId: new mongoose.Types.ObjectId(chatId) }, // Match messages by chatId
      },
      {
        $addFields: {
          sendByMe: {
            $eq: ["$senderId", new mongoose.Types.ObjectId(userId)], // Check if senderId matches userId
          },
        },
      },
      {
        $sort: { createdAt: 1 }, // Sort by createdAt in ascending order
      },
    ]);

    return messages;
  } catch (error:any) {
    // console.log("Error fetching messages by chatId:", error.message);
    throw error;
  }
};

// mark a message as read
export const markMessageAsRead = async (messageId: string, userId: string) => {
  const message = await Message.findById(messageId);
  try {
    // Find the message by ID
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error("Message not found");
    }

    // Check if the user ID is already in the readBy array
    if (message.readBy && !message.readBy.includes(new mongoose.Types.ObjectId(userId))) {
      message.readBy.push(new mongoose.Types.ObjectId(userId));
      await message.save(); // Save the updated message
    }

    return message;
  } catch (error:any) {
    console.error("Error marking message as read:", error);
    throw error;
  }
};
