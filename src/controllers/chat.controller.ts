import { NextFunction, Response } from "express";
import { createChat, findChatWithTwoMembers, getChatById, getUserChats } from "../services/chat.service";
import { AuthenticatedRequest } from "../interfaces/AuthenticatedRequest";
import { findUsersByName, getUserById } from "../services/user.service";
import StatusCode from "http-status-codes";
import { getMessagesByChat } from "../services/message.service";

/**
 * Create a new chat.
 */

export const createChatController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // check if member provided for chat
    const memberId = req.params.id;
    const authUserId = req.user?._id as string;

    if (!memberId) return res.status(StatusCode.BAD_REQUEST).json({ message: "Provide a userId as chat member" });

    // validate userId
    const member = await getUserById(memberId);
    if (!member) return res.status(StatusCode.BAD_REQUEST).json({ message: "Invalid userId" });

    // check if authuser and provided member have already have a chat then send the chat 
    const isChatExist = await findChatWithTwoMembers(authUserId, memberId);
    if (isChatExist) return res.status(StatusCode.OK).json({ message: "Chat already exsist", chat: isChatExist });

    // create new chat
    const chat = await createChat(authUserId, memberId);
    res.status(StatusCode.CREATED).json({ message: "Chat created successfully", chat });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get a chat by ID.
 */
export const getChatByIdController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?._id;
    const chatId = req.params.id;
    // check if chatId provided
    if (!chatId) return res.status(StatusCode.BAD_REQUEST).json({ message: "Provide a chatId" });

    // check the chatId is valid
    const chat = await getChatById(chatId);
    if (!chat) return res.status(StatusCode.NOT_FOUND).json({ message: "Chat not found" });

    // validate the chat belong to the user
    const isbelongs = chat.members.filter(user => user === userId);
    if (!isbelongs) return res.status(StatusCode.UNAUTHORIZED).json({ message: "Not Authorized to get this chat" });

    // get all the messages of this chat
    // const messages = await getMessagesByChat(chat._id as string);

    //send response
    res.status(StatusCode.OK).json({
      chat
    });
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get all chats for a user.
 */
export const getUserChatsController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const userId = req.user?._id;
    // const chats = await getUserChatsWithLatestMessage(userId as string);
    const chats = await getUserChats(userId as string);
    //send response
    res.status(StatusCode.OK).json(chats);
  } catch (error: any) {
    next(error);
  }
};

/**
 * Get users by name controller
 */
export const searchUserController = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    const name = req.params.name;
    if (!name) return res.status(StatusCode.BAD_REQUEST).json({ message: "Provide a name" });

    const users = await findUsersByName(name);

    res.status(StatusCode.OK).json(users);
  } catch (error: any) {
    next(error);
  }
};
