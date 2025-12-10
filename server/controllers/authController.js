import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET;

// ------------------ LOGIN ------------------
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Debug log
    console.log('🔐 Login attempt for email:', email);

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1', 
      [email]
    );

    if (result.rows.length === 0) {
      console.log('❌ User not found for email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];
    console.log('✅ User found:', user.username);

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('🎫 Token generated for user:', user.username);

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        bio: user.bio || '',
        githubUrl: user.github_url || '',
        theme: user.theme || 'light'
      }
    });

  } catch (error) {
    console.error('❌ Login controller error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
};

// ------------------ REGISTER ------------------
export const register = async (req, res) => {
  try {
    const { email, password, username, skills = [], lookingFor = [] } = req.body;

    console.log('📝 Registration attempt:', { email, username });

    // Validation
    if (!email || !password || !username) {
      return res.status(400).json({ 
        success: false,
        message: 'Email, username, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: 'Password must be at least 6 characters' 
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      const errorMsg = existingUser.rows[0].email === email 
        ? 'Email already registered' 
        : 'Username already taken';
      return res.status(409).json({ 
        success: false,
        message: errorMsg 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, username, skills, looking_for, avatar_url) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, username, avatar_url, skills, looking_for, bio, github_url, theme, created_at`,
      [email, hashedPassword, username, skills, lookingFor, 
       `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User registered:', user.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        bio: user.bio || '',
        githubUrl: user.github_url || '',
        theme: user.theme || 'light'
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration' 
    });
  }
};

// ------------------ GET CURRENT USER ------------------
export const getMe = async (req, res) => {
  try {
    console.log('👤 getMe called for user ID:', req.user?.userId);

    const result = await pool.query(
      `SELECT id, email, username, avatar_url, skills, looking_for, bio, github_url, theme, created_at 
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    const user = result.rows[0];
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        avatarUrl: user.avatar_url,
        skills: user.skills || [],
        lookingFor: user.looking_for || [],
        bio: user.bio || '',
        githubUrl: user.github_url || '',
        theme: user.theme || 'light',
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('❌ Get me error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};