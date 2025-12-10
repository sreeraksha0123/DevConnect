import { Heart, MessageCircle, Clock, Share2, Bookmark } from 'lucide-react';
import { useState } from 'react';
import api from '../utils/api';

const PostCard = ({ post, onLike }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleLike = async () => {
    try {
      if (liked) {
        // Unlike
        setLikes(prev => prev - 1);
      } else {
        // Like
        setLikes(prev => prev + 1);
        if (onLike) onLike(post.id);
      }
      setLiked(!liked);
      
      // In real app: await api.post(`/posts/${post.id}/like`);
    } catch (error) {
      console.error('Like error:', error);
      // Revert on error
      setLiked(false);
      setLikes(post.likes || 0);
    }
  };

  const handleSave = () => {
    setSaved(!saved);
    // In real app: await api.post(`/posts/${post.id}/save`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 mb-4 hover:shadow-xl transition-all duration-300">
      {/* User Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={post.user.avatarUrl}
            alt={post.user.username}
            className="w-12 h-12 rounded-full border-2 border-purple-500"
          />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {post.user.username}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatDate(post.createdAt)}</span>
              {post.user.title && (
                <>
                  <span>•</span>
                  <span>{post.user.title}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`p-2 rounded-lg transition-colors ${
            saved
              ? 'text-cyan-500 bg-cyan-500/10'
              : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
        {post.title}
      </h2>
      <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-line">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 text-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Skills */}
      {post.user.skills && post.user.skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.user.skills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Code Snippet (if present) */}
      {post.codeSnippet && (
        <div className="mb-4 p-4 bg-gray-900 rounded-xl font-mono text-sm text-gray-100 overflow-x-auto">
          <pre>{post.codeSnippet}</pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
              liked
                ? 'bg-red-500/10 text-red-500'
                : 'text-gray-500 dark:text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            <span className="font-medium">{likes}</span>
          </button>
          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-cyan-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments?.length || 0}</span>
          </button>
        </div>
        <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300">
          <Share2 className="w-5 h-5" />
          <span className="font-medium">Share</span>
        </button>
      </div>
    </div>
  );
};

export default PostCard;