import express from "express";
import { authenticate } from "./authMiddleware.js";
import { getMessagesWithUser, createMessage } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:otherUserId", authenticate, getMessagesWithUser);
router.post("/", authenticate, createMessage);

export default router;
