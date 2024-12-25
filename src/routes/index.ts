import { Router } from "express";
import {
  createUserController,
  getUserByIdController,
  loginController,
} from "../controllers/user.controller";

import {
  createChatController,
  getUserChatsController,
  searchUserController,
} from "../controllers/chat.controller";

import {
  sendMessageController,
  getMessagesByChatIdController,
  markAsReadController,
} from "../controllers/message.controller";
import { authenticate } from "../middlewares/authenticate";
import { uploadProfileController } from "../controllers/upload.controlloer";
import { upload } from "../middlewares/multer";

const router = Router();

// User routes
router.post("/users/create", createUserController); //create a new user
router.post("/users/login", loginController); // login user
router.get("/users/:id", authenticate, getUserByIdController); // get user details
router.get("/users/search/:name", authenticate, searchUserController); // get user details


// Chat routes
router.post("/chats/:id", authenticate, createChatController); // create a new chat
router.get("/chats", authenticate, getUserChatsController); // Get all chats of a user

// Message routes
router.post("/messages", authenticate, sendMessageController); // send a new message to a chat
router.post("/messages/mark-read/:id", authenticate, markAsReadController); // marked a message as read
router.get("/messages/chat/:chatId", authenticate, getMessagesByChatIdController); // get all message of a chat

// upload routes
router.post("/upload", authenticate, upload.single('photo'), uploadProfileController); // upload an image

export default router;
