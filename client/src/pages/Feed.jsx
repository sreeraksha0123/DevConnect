import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, Sparkles, Filter, TrendingUp } from 'lucide-react';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import api from '../utils/api';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error('Load posts error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    setCreating(true);
    try {
      const response = await api.post('/posts', newPost);
      setPosts([response.data, ...posts]);
      setNewPost({ title: '', content: '', tags: [] });
      setShowCreatePost(false);
    } catch (error) {
      console.error('Create post error:', error);
    } finally {
      setCreating(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newPost.tags.includes(tagInput.trim())) {
      setNewPost({ ...newPost, tags: [...newPost.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setNewPost({ ...newPost, tags: newPost.tags.filter((t) => t !== tag) });
  };

  const filteredPosts = posts.filter(post => {
    if (filter === 'trending') return post.likes > 10;
    if (filter === 'recent') {
      const postDate = new Date(post.createdAt);
      const now = new Date();
      return (now - postDate) < 24 * 60 * 60 * 1000; // Last 24 hours
    }
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Developer Feed
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Latest from the community</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreatePost(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
              filter === 'trending'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filter === 'recent'
                ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Recent
          </button>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Post
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Share your thoughts with the community
                </p>
              </div>
              <button
                onClick={() => setShowCreatePost(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={newPost.title}
                  onChange={(e) =>
                    setNewPost({ ...newPost, title: e.target.value })
                  }
                  className="input"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  required
                  rows={6}
                  value={newPost.content}
                  onChange={(e) =>
                    setNewPost({ ...newPost, content: e.target.value })
                  }
                  className="input"
                  placeholder="Share your thoughts, code snippets, or project updates..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addTag())
                    }
                    className="input flex-1"
                    placeholder="react, javascript, typescript..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="btn-secondary px-4"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-purple-800 dark:hover:text-purple-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePost(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Share with Community</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Posts */}
      {loading ? (
        <>
          <SkeletonLoader type="post" />
          <SkeletonLoader type="post" />
          <SkeletonLoader type="post" />
        </>
      ) : filteredPosts.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <TrendingUp className="w-full h-full text-gray-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 rounded-full blur-xl"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {filter === 'all' ? 'No Posts Yet' : 'No Matching Posts'}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {filter === 'all'
              ? "Be the first to share something with the community!"
              : `No ${filter} posts found. Try a different filter.`}
          </p>
          
          {filter === 'all' && (
            <button
              onClick={() => setShowCreatePost(true)}
              className="btn-primary flex items-center justify-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Post</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Feed;