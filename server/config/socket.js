import jwt from 'jsonwebtoken';
import pool from '../models/db.js';

const onlineUsers = new Map(); // userId -> { socketId, username, avatarUrl }
const userSockets = new Map(); // userId -> Set of socket IDs (for multiple connections)

export const setupSocket = (io) => {
  // Store io instance globally for use in controllers
  global.io = io;
  
  // Authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ Socket connection attempt without token');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.username = decoded.username;
      
      // Get user details from database
      const userResult = await pool.query(
        'SELECT username, avatar_url FROM users WHERE id = $1',
        [decoded.userId]
      );
      
      if (userResult.rows.length === 0) {
        return next(new Error('User not found'));
      }
      
      socket.userData = {
        id: decoded.userId,
        username: userResult.rows[0].username,
        avatarUrl: userResult.rows[0].avatar_url
      };
      
      next();
    } catch (err) {
      console.error('Socket auth error:', err.message);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Socket connected: ${socket.username} (${socket.userId}) - ${socket.id}`);
    
    // Track online user
    if (!userSockets.has(socket.userId)) {
      userSockets.set(socket.userId, new Set());
    }
    userSockets.get(socket.userId).add(socket.id);
    
    onlineUsers.set(socket.userId, {
      socketId: socket.id,
      username: socket.username,
      avatarUrl: socket.userData?.avatarUrl,
      lastSeen: new Date()
    });
    
    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    
    // Notify user of their connection
    socket.emit('connected', { 
      userId: socket.userId, 
      socketId: socket.id,
      onlineCount: onlineUsers.size
    });
    
    // Broadcast user online status
    socket.broadcast.emit('user-online', { 
      userId: socket.userId,
      username: socket.username,
      avatarUrl: socket.userData?.avatarUrl
    });
    
    // Send online users list to new connection
    const onlineUsersList = Array.from(onlineUsers.entries()).map(([id, data]) => ({
      userId: id,
      username: data.username,
      avatarUrl: data.avatarUrl
    }));
    socket.emit('online-users-list', onlineUsersList);

    // ------------------ CHAT ROOM HANDLERS ------------------
    
    // Join a specific chat room
    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      console.log(`👥 User ${socket.userId} joined chat: ${chatId}`);
      
      // Notify others in chat
      socket.to(`chat:${chatId}`).emit('user-joined-chat', {
        userId: socket.userId,
        username: socket.username
      });
    });

    // Leave a chat room
    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
      console.log(`👋 User ${socket.userId} left chat: ${chatId}`);
    });

    // Send message in chat
    socket.on('send-message', async (data) => {
      try {
        const { chatId, content, tempId } = data;
        
        if (!chatId || !content || content.trim() === '') {
          return socket.emit('message-error', { 
            tempId,
            message: 'Chat ID and message content required' 
          });
        }

        // Verify user has access to this chat
        const chatAccess = await pool.query(
          `SELECT 1 FROM chats 
           WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`,
          [chatId, socket.userId]
        );

        if (chatAccess.rows.length === 0) {
          return socket.emit('message-error', {
            tempId,
            message: 'Access denied to this chat'
          });
        }

        // Save message to database
        const result = await pool.query(
          `INSERT INTO messages (chat_id, sender_id, content) 
           VALUES ($1, $2, $3) 
           RETURNING id, chat_id, sender_id, content, read, created_at`,
          [chatId, socket.userId, content.trim()]
        );

        const message = result.rows[0];

        // Get chat details to find other user
        const chatResult = await pool.query(
          `SELECT 
            CASE 
              WHEN user1_id = $1 THEN user2_id
              ELSE user1_id
            END as other_user_id
           FROM chats WHERE id = $2`,
          [socket.userId, chatId]
        );

        const otherUserId = chatResult.rows[0]?.other_user_id;

        // Enhanced message data with sender info
        const messageData = {
          id: message.id,
          chatId: message.chat_id,
          senderId: message.sender_id,
          content: message.content,
          read: message.read,
          createdAt: message.created_at,
          sender: {
            username: socket.username,
            avatarUrl: socket.userData?.avatarUrl
          }
        };

        // Emit to chat room
        io.to(`chat:${chatId}`).emit('receive-message', {
          ...messageData,
          tempId // Include tempId for frontend tracking
        });

        // Notify other user if they're not in the chat room
        if (otherUserId) {
          // Update chat's last message
          await pool.query(
            `UPDATE chats 
             SET last_message = $1, last_message_at = NOW() 
             WHERE id = $2`,
            [content.substring(0, 100), chatId]
          );

          // Send notification to other user
          io.to(`user:${otherUserId}`).emit('new-message-notification', {
            chatId,
            senderId: socket.userId,
            senderName: socket.username,
            preview: content.substring(0, 50),
            timestamp: new Date().toISOString()
          });
        }

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message-error', { 
          message: 'Failed to send message' 
        });
      }
    });

    // ------------------ TYPING INDICATORS ------------------
    
    socket.on('typing-start', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user-typing', {
        userId: socket.userId,
        username: socket.username,
        chatId
      });
    });

    socket.on('typing-stop', (data) => {
      const { chatId } = data;
      socket.to(`chat:${chatId}`).emit('user-stop-typing', {
        userId: socket.userId,
        chatId
      });
    });

    // ------------------ MESSAGE STATUS ------------------
    
    socket.on('mark-messages-read', async (data) => {
      try {
        const { chatId } = data;
        
        await pool.query(
          `UPDATE messages 
           SET read = true, read_at = NOW()
           WHERE chat_id = $1 
             AND sender_id != $2 
             AND read = false`,
          [chatId, socket.userId]
        );

        // Notify sender that messages were read
        const chatResult = await pool.query(
          `SELECT 
            CASE 
              WHEN user1_id = $1 THEN user2_id
              ELSE user1_id
            END as other_user_id
           FROM chats WHERE id = $2`,
          [socket.userId, chatId]
        );

        const otherUserId = chatResult.rows[0]?.other_user_id;
        if (otherUserId) {
          io.to(`user:${otherUserId}`).emit('messages-read', {
            chatId,
            readerId: socket.userId,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // ------------------ NEW MATCH NOTIFICATION ------------------
    
    // This is called from matchController when mutual match happens
    socket.on('notify-match', (data) => {
      const { matchedUserId, chatId } = data;
      
      // Emit to both users
      io.to(`user:${socket.userId}`).to(`user:${matchedUserId}`).emit('new-match', {
        chatId,
        users: [
          {
            id: socket.userId,
            username: socket.username,
            avatarUrl: socket.userData?.avatarUrl
          },
          {
            id: matchedUserId,
            // We'll need to fetch matched user details from controller
          }
        ],
        timestamp: new Date().toISOString()
      });
    });

    // ------------------ DISCONNECTION HANDLING ------------------
    
    socket.on('disconnect', (reason) => {
      console.log(`❌ Socket disconnected: ${socket.username} (${socket.userId}) - Reason: ${reason}`);
      
      // Remove socket from user's socket set
      if (userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        
        // If no more sockets for this user, remove from online users
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
          onlineUsers.delete(socket.userId);
          
          // Broadcast user offline status
          socket.broadcast.emit('user-offline', { 
            userId: socket.userId 
          });
        }
      }
      
      // Broadcast updated online count
      io.emit('online-users-count', onlineUsers.size);
    });

    // ------------------ ERROR HANDLING ------------------
    
    socket.on('error', (error) => {
      console.error(`Socket error for user ${socket.userId}:`, error);
    });
  });

  // Helper function to get online status
  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  // Helper function to get user sockets
  const getUserSockets = (userId) => {
    return userSockets.get(userId) || new Set();
  };

  // Attach helpers to io for use in controllers
  io.isUserOnline = isUserOnline;
  io.getUserSockets = getUserSockets;
  io.getOnlineUsers = () => Array.from(onlineUsers.entries()).map(([id, data]) => ({
    userId: id,
    ...data
  }));
};