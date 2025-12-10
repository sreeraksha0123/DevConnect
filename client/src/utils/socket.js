// client/src/utils/socket.js
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let isConnecting = false;

export const initSocket = (token) => {
  // Prevent multiple connections
  if (socket?.connected) {
    console.log('🔗 Socket already connected');
    return socket;
  }
  
  if (isConnecting) {
    console.log('⏳ Socket connection in progress...');
    return socket;
  }
  
  try {
    isConnecting = true;
    console.log('🔌 Initializing socket with token:', token ? 'Exists' : 'Missing');
    
    if (!token) {
      console.warn('⚠️ No token provided for socket connection');
      isConnecting = false;
      return null;
    }
    
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      timeout: 20000
    });
    
    // Debug events
    socket.on('connect', () => {
      console.log('✅ Socket connected, ID:', socket.id);
      isConnecting = false;
    });
    
    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      isConnecting = false;
    });
    
    socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error.message);
      isConnecting = false;
    });
    
    socket.on('error', (error) => {
      console.error('💥 Socket error:', error);
    });
    
    return socket;
    
  } catch (error) {
    console.error('❌ Socket initialization error:', error);
    isConnecting = false;
    return null;
  }
};

export const getSocket = () => {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket not connected');
    return null;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log('🔌 Disconnecting socket...');
    socket.disconnect();
    socket = null;
    isConnecting = false;
  }
};

// Safe join/leave chat rooms
export const joinChatRoom = (chatId) => {
  const sock = getSocket();
  if (sock && chatId) {
    sock.emit('join-chat', chatId);
    console.log(`👥 Joining chat room: ${chatId}`);
  }
};

export const leaveChatRoom = (chatId) => {
  const sock = getSocket();
  if (sock && chatId) {
    sock.emit('leave-chat', chatId);
    console.log(`👋 Leaving chat room: ${chatId}`);
  }
};