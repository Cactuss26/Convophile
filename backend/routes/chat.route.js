import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { getUsers } from "../controllers/user.controller.js";
import { getConversations, openChatRequest } from "../controllers/conv.controller.js";
import { getMessages, sendMessage } from "../controllers/messages.controller.js";

const router = Router();

router.get("/users", verifyToken, getUsers);
router.get("/conversations", verifyToken, getConversations);
router.post("/conversations", verifyToken, openChatRequest);
router.get("/messages/:conversationId", verifyToken, getMessages);
router.post("/messages", verifyToken, sendMessage);

export default router;