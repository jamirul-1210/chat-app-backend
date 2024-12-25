import { NextFunction, Response } from "express";
import { sendMessage, getMessagesByChatId, markMessageAsRead } from "../services/message.service";
import { z } from "zod";
import { addMessageToChat, getChatById } from "../services/chat.service";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { formatZodErrors } from "../utils/zodHelper";
import { StatusCodes } from "http-status-codes";
import { messageSchema } from "../schemas/message.schema";
import { sendEventInBackground } from "../jobs/sendmessage";
import { MESSAGE_READ_RECEIVED, NEW_MESSAGE_RECEIVED } from "../config/events";


// Controller function to send a new message
export const sendMessageController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // get requests from request body and validate them
    const { chatId, content } = messageSchema.parse(req.body);
    const senderId = req.user?._id;

    // check if chatid is provided and valid chatId is provided
    const isAValidChatId = await getChatById(chatId);
    if (!isAValidChatId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid chatId" });

    // check if the user is a member of the chat
    const newCreatedMessage = await sendMessage({ chatId, senderId, content, readBy: [senderId] });
    if (!newCreatedMessage) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "somthing went wrong while message creation" });

    // add message to chat room
    const updatetedChat = await addMessageToChat(chatId, (newCreatedMessage._id) as string);
    if (!updatetedChat) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "somthing went wrong while message creation" });

    // emit event to all the members in a chat with new message
    sendEventInBackground(updatetedChat.members.map(member => member.toString()), newCreatedMessage, NEW_MESSAGE_RECEIVED);

    // send response to user with created message
    res.status(StatusCodes.CREATED).json(newCreatedMessage);
  } catch (error) {
    // handle zod error and other errors
    if (error instanceof z.ZodError) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: "Validation error", errors: formatZodErrors(error) });
    } else {
      next(error)
    }
  }
};

// Controller function to get messages by chatId
export const getMessagesByChatIdController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // Get requests from request body
    const chatId = req.params.chatId;
    const userId = req.user?._id;

    // check if chatid is provided
    if (!chatId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Provide chatId" });

    // validate chatId
    const isAValidChatId = await getChatById(chatId);
    if (!isAValidChatId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Invalid chatId" });

    // check if the user is a member of the chat
    const isMember = isAValidChatId.members.filter(id => id === userId)
    if (!isMember) return res.status(StatusCodes.UNAUTHORIZED).json({ message: "Not authorized to get this chat" });

    // send response to user
    const messages = await getMessagesByChatId(chatId, userId as string);
    if (!messages) return res.status(StatusCodes.NOT_FOUND).json({ message: "Messages not found" });

    // send response to user with messages
    res.status(StatusCodes.OK).json(messages);

  } catch (error: any) {
    next(error);
  }
};


// Controller function mark a message as read 
export const markAsReadController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  
  const userId = req.user?._id as string;
  const messageId = req.params.id;
  // check if the message id provided
  if (!messageId) return res.status(StatusCodes.BAD_REQUEST).json({ message: "Provide message id" });

  try {
    
    const markedMessage = await markMessageAsRead(messageId, userId);
    // get the chat
    const chat = await getChatById(markedMessage.chatId.toString());
    if (!chat) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Chat not found" });
    const members = chat.members.map(member => member._id.toString());
    // emit event to all the members in a chat with new message
    sendEventInBackground(members, markedMessage, MESSAGE_READ_RECEIVED);

    res.status(StatusCodes.OK).json({ message: "Message marked as read successfully", markedMessage });
  } catch (error: any) {
    console.error("Error in markAsReadController:", error);
    next(error);
  }
};