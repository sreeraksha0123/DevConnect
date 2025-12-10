import express from 'express';
import { 
  updateProfile, 
  getProfile,
  searchUsers  // ← IMPORT MISSING FUNCTION
} from '../controllers/usersController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ✅ Get current user's profile
router.get('/profile', authenticateToken, getProfile);

// ✅ Get any user's profile by ID
router.get('/profile/:userId', authenticateToken, getProfile); // ← ADD THIS

// ✅ Update current user's profile
router.put('/profile', authenticateToken, updateProfile);

// ✅ Search users
router.get('/search', authenticateToken, searchUsers); // ← ADD SEARCH ROUTE

export default router;