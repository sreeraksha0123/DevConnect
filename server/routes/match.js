import express from 'express';
import { 
  getRecommendations, 
  createMatch, 
  getMatches,
  getPendingMatches  // ← IMPORT MISSING FUNCTION
} from '../controllers/matchController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommendations', authenticateToken, getRecommendations);
router.post('/', authenticateToken, createMatch);
router.get('/', authenticateToken, getMatches);
router.get('/pending', authenticateToken, getPendingMatches); // ← ADD NEW ROUTE

export default router;