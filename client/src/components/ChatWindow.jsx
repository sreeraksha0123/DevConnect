import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, User } from 'lucide-react';
import { getSocket } from '../utils/socket';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const ChatWindow = ({ match, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadMessages();

    if (socket) {
      socket.on('receive-message', (message) => {
        if (message.senderId === match.user.id) {
          setMessages((prev) => [...prev, message]);
        }
      });

      socket.on('user-typing', (data) => {
        if (data.userId === match.user.id) {
          setIsTyping(true);
        }
      });

      socket.on('user-stop-typing', (data) => {
        if (data.userId === match.user.id) {
          setIsTyping(false);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('user-stop-typing');
      }
    };
  }, [match, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${match.user.id}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!newMessage.trim() || !socket) return;

    socket.emit('send-message', {
      receiverId: match.user.id,
      content: newMessage.trim(),
    });

    const tempMessage = {
      id: Date.now(),
      senderId: user.id,
      receiverId: match.user.id,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      sender: {
        username: user.username,
        avatarUrl: user.avatarUrl,
      },
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage('');
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!socket) return;

    socket.emit('typing', { receiverId: match.user.id });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    if (!socket) return;
    socket.emit('stop-typing', { receiverId: match.user.id });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 mb-4 flex items-center space-x-3 shadow-lg">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="relative">
          <img
            src={match.user.avatarUrl}
            alt={match.user.username}
            className="w-10 h-10 rounded-full border-2 border-purple-500"
          />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900"></div>
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {match.user.username}
          </h2>
          {isTyping ? (
            <p className="text-sm text-cyan-500">typing...</p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {match.user.skills?.[0] || 'Developer'}
            </p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 px-2">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/10 to-cyan-500/10 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400">
              No messages yet. Say hello! 👋
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const isSent = message.senderId === user.id;
            return (
              <div
                key={message.id}
                className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                    isSent
                      ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                >
                  <p>{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;