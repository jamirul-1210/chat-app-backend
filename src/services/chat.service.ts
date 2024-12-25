import mongoose from "mongoose";
import { IChat, Chat } from "../models/chat.model";

/**
 * Create a new chat.
 */
export const createChat = async (authUserId: string, memberId: string): Promise<IChat> => {
  return (await Chat.create({ members: [authUserId, memberId] })).populate({
    path: "members",
    select: "-password",
    match: { _id: { $ne: authUserId } }, // Exclude the user with userId
  });
};

/**
 * Get a chat by its ID.
 */
export const getChatById = async (chatId: string): Promise<IChat | null> => {
  return Chat.findById(chatId)
    .populate("members", "-password") // Populate members without password
    .populate("messages")
    .exec();
};

/**
 * Get all chats a user is part of.
 */

export const getUserChats = async (userId: string): Promise<IChat[]> => {
  const chats = await Chat.find({ members: userId })
    .populate({
      path: "members",
      select: "-password -agreeToTerms -ispublic -email",
      match: { _id: { $ne: userId } },
    })
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 }, limit: 2 }, // Fetch only the latest message
    })
    .exec();

    // return chats
  // Sort the chats based on the latest message's createdAt field
  return chats.sort((a:any, b:any) => {
    const aLatestMessage = a.messages?.[0]?.createdAt || 0;
    const bLatestMessage = b.messages?.[0]?.createdAt || 0;
    return new Date(bLatestMessage).getTime() - new Date(aLatestMessage).getTime();
  });
};



/**
 * Get a chat with two specific member.
 */
export const findChatWithTwoMembers = async (userId: string, memberId: string) => {

  return Chat.findOne({
    members: {
      $all: [userId, memberId],
      $size: 2,
    },
  }).populate({
    path: "members",
    select: "-password",
    match: { _id: { $ne: userId } }, // Exclude the user with userId
  });
};

/**
 * find and update message field of a chat by chatId
 */
export const addMessageToChat = async (chatId: string, messageId: string): Promise<IChat | null> => {
  try {
    // Find the chat and update its messages array
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageId } },
      { new: true } // Return the updated document
    )
    if (!updatedChat) {
      throw new Error("Chat not found");
    }

    return updatedChat;
  } catch (error) {
    console.error("Error updating chat:", error);
    throw error;
  }
};

