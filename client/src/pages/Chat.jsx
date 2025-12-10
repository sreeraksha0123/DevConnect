import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageCircle, Sparkles, Users, Search } from 'lucide-react';
import ChatWindow from '../components/ChatWindow';
import api from '../utils/api';

const Chat = () => {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await api.get('/match');
      setMatches(response.data);
    } catch (error) {
      console.error('Load matches error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match =>
    match.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.user.skills?.some(skill => 
      skill.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Connect with your matches</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-700 animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-24 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Messages
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Connect with your matches</p>
            </div>
          </div>
          
          {matches.length > 0 && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
              <Users className="w-4 h-4" />
              <span className="font-medium">{matches.length} connections</span>
            </div>
          )}
        </div>

        {/* Search Bar */}
        {matches.length > 0 && (
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <MessageCircle className="w-full h-full text-gray-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 rounded-full blur-xl"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            No Conversations Yet
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start matching with developers who share your interests to begin chatting!
          </p>
          
          <button
            onClick={() => window.location.href = '/match'}
            className="btn-primary flex items-center justify-center space-x-2 mx-auto"
          >
            <Sparkles className="w-4 h-4" />
            <span>Find Matches</span>
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Matches List */}
          <div className={`space-y-3 ${selectedMatch ? 'hidden md:block' : 'md:col-span-3 lg:col-span-1'}`}>
            {filteredMatches.map((match) => (
              <button
                key={match.id}
                onClick={() => setSelectedMatch(match)}
                className={`card p-4 w-full text-left transition-all duration-300 hover:scale-[1.02] ${
                  selectedMatch?.id === match.id
                    ? 'ring-2 ring-purple-500 bg-gradient-to-r from-purple-500/5 to-cyan-500/5'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={match.user.avatarUrl}
                      alt={match.user.username}
                      className="w-12 h-12 rounded-full border-2 border-gray-300 dark:border-gray-700"
                    />
                    {match.user.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {match.user.username}
                      </h3>
                      {match.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                          {match.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {match.lastMessage || 'Start a conversation...'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {match.user.skills?.slice(0, 2).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Window */}
          <div className={`${!selectedMatch ? 'hidden md:block md:col-span-2 lg:col-span-2' : 'md:col-span-3 lg:col-span-2'}`}>
            {selectedMatch ? (
              <div className="card h-full">
                <ChatWindow
                  match={selectedMatch}
                  onBack={() => setSelectedMatch(null)}
                />
              </div>
            ) : (
              <div className="card p-12 text-center h-full flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mb-6">
                  <MessageCircle className="w-full h-full text-gray-400" />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 rounded-full blur-xl"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Select a Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Choose a developer from the list to start chatting
                </p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Real-time messaging • Code sharing • Voice notes</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;