// ---------------------------------------------
// 🌐 DevConnect Backend Server (Express + Socket.IO)
// ---------------------------------------------

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import local modules
import pool from './models/db.js';
import { setupSocket } from './config/socket.js';
import { authenticateToken } from './middleware/auth.js';

// Import routes
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import matchRoutes from './routes/match.js';
import usersRoutes from './routes/users.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Configure Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ---------------------------------------------
// 🧩 Middleware
// ---------------------------------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------
// 🩺 Health Check Route
// ---------------------------------------------
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---------------------------------------------
// 🧭 API Routes
// ---------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/users', usersRoutes);

// ---------------------------------------------
// 💬 Chat Messages API (Protected)
// ---------------------------------------------
app.get('/api/messages/:userId', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    const result = await pool.query(
      `SELECT 
        m.id, m.sender_id, m.receiver_id, m.content, m.read, m.created_at,
        u.username as sender_username, u.avatar_url as sender_avatar
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.created_at ASC`,
      [currentUserId, userId]
    );

    const messages = result.rows.map(row => ({
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      read: row.read,
      createdAt: row.created_at,
      sender: {
        username: row.sender_username,
        avatarUrl: row.sender_avatar,
      },
    }));

    res.json(messages);
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------------------------------
// ⚡ Setup Socket.IO
// ---------------------------------------------
setupSocket(io);

// ---------------------------------------------
// 🧱 Error Handling Middleware
// ---------------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------------------------------
// 🚫 404 Handler
// ---------------------------------------------
app.use( (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------------------------------------------
// 🚀 Start Server
// ---------------------------------------------
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});
