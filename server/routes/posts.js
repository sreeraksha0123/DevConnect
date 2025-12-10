import express from 'express';
import { 
  getPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  likePost,
  getPostById  // ← IMPORT MISSING FUNCTION
} from '../controllers/postsController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById); // ← ADD GET SINGLE POST
router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/like', authenticateToken, likePost);

export default router;