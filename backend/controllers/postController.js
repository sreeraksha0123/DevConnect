import { Post } from "../models/postModel.js";

export const createPost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { content } = req.body;

    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = await Post.create({ author: userId, content });

    res.status(201).json({ message: "Post created", post });
  } catch (err) {
    console.error("CreatePost error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ posts });
  } catch (err) {
    console.error("GetFeed error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleLikePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasLiked = post.likes.includes(userId);
    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ message: hasLiked ? "Unliked" : "Liked", likes: post.likes.length });
  } catch (err) {
    console.error("ToggleLike error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (String(post.author) !== String(userId)) {
      return res.status(403).json({ message: "You can delete only your own posts" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    console.error("DeletePost error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
