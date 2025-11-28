import express from "express";
import { authenticate } from "./authMiddleware.js";
import { createPost, getFeed, toggleLikePost, deletePost } from "../controllers/postController.js";

const router = express.Router();

router.get("/", authenticate, getFeed);
router.post("/", authenticate, createPost);
router.put("/:id/like", authenticate, toggleLikePost);
router.delete("/:id", authenticate, deletePost);

export default router;
