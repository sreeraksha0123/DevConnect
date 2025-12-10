import jwt from 'jsonwebtoken';
import pool from '../models/db.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Access token required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active in database
    const userResult = await pool.query(
      'SELECT id, email, username, avatar_url FROM users WHERE id = $1 AND active = true',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        success: false,
        message: 'User account not found or inactive' 
      });
    }

    // Attach enhanced user data
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      ...userResult.rows[0]
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error during authentication' 
    });
  }
};

// Optional authentication middleware
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Verify user exists
      const userResult = await pool.query(
        'SELECT id, email, username, avatar_url FROM users WHERE id = $1 AND active = true',
        [decoded.userId]
      );

      if (userResult.rows.length > 0) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          username: decoded.username,
          ...userResult.rows[0]
        };
      }
    } catch (error) {
      console.warn("⚠️ Invalid or expired token in optionalAuth:", error.message);
      // Don't throw error for optional auth
    }
  }
  
  next();
};

// Generate JWT token helper
export const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email, 
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};