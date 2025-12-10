import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Sparkles, Heart, X, Filter, RefreshCw } from "lucide-react";
import MatchCard from "../components/MatchCard";
import SkeletonLoader from "../components/SkeletonLoader";
import api from "../utils/api";

const Match = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [matchCount, setMatchCount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    skills: [],
    location: "",
    online: false,
  });

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/match/recommendations", {
        params: filters,
      });
      setRecommendations(response.data);
      setCurrentIndex(0);
    } catch (error) {
      console.error("Load recommendations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (userId) => {
    try {
      await api.post("/match", {
        matchedUserId: userId,
        status: "accepted",
      });
      setMatchCount((prev) => prev + 1);
      setCurrentIndex((prev) => prev + 1);
      
      // Success feedback
      if (matchCount + 1 === 1) {
        console.log("🎉 First match! Check your chats to connect.");
      }
    } catch (error) {
      console.error("Accept match error:", error);
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post("/match", {
        matchedUserId: userId,
        status: "rejected",
      });
      setCurrentIndex((prev) => prev + 1);
    } catch (error) {
      console.error("Reject match error:", error);
    }
  };

  const handleRefresh = () => {
    loadRecommendations();
  };

  const currentUser = recommendations[currentIndex];

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center animate-pulse">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Find Matches
                </h1>
                <p className="text-gray-500 dark:text-gray-400">Discover developers who share your interests</p>
              </div>
            </div>
          </div>
          <div className="animate-pulse h-10 w-10 bg-gray-700 rounded-xl"></div>
        </div>
        <SkeletonLoader type="match" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600/30 to-cyan-500/30 rounded-3xl blur-xl"></div>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Find Matches
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Swipe through devs who share your stack</p>
            </div>
          </div>
        </div>

        {/* Stats & Controls */}
        <div className="flex items-center space-x-4">
          {matchCount > 0 && (
            <div className="hidden md:flex items-center space-x-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
              <Heart className="w-4 h-4" />
              <span className="font-semibold">{matchCount}</span>
              <span className="text-sm">matches</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${
                showFilters
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden md:inline">Filters</span>
            </button>
            
            <button
              onClick={handleRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-6 animate-slide-down">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Skills
              </label>
              <input
                type="text"
                placeholder="React, Node.js, Python..."
                className="input"
                onChange={(e) => setFilters({ ...filters, skills: e.target.value.split(',').map(s => s.trim()) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country..."
                className="input"
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center space-x-3 cursor-pointer p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.online}
                    onChange={(e) => setFilters({ ...filters, online: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${filters.online ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transform transition-transform ${filters.online ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
                <span className="text-gray-700 dark:text-gray-300">Online now</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setFilters({ skills: [], location: "", online: false })}
              className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
            >
              Clear All
            </button>
            <button
              onClick={loadRecommendations}
              className="btn-primary px-6"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Match Counter */}
      {recommendations.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <div className="text-gray-500 dark:text-gray-400">
            <span className="text-purple-500 font-semibold">{currentIndex + 1}</span>
            <span className="mx-2">of</span>
            <span className="font-semibold">{recommendations.length}</span>
            <span className="ml-2">developers</span>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Swipe right to match</span>
            </div>
            <div className="flex items-center space-x-2">
              <X className="w-4 h-4 text-red-400" />
              <span>Swipe left to pass</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!currentUser ? (
        <div className="card p-12 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <Users className="w-full h-full text-gray-400" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-500/20 rounded-full blur-xl"></div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {matchCount > 0 ? "Great Job!" : "All Caught Up!"}
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            {matchCount > 0
              ? `You've made ${matchCount} awesome match${matchCount > 1 ? 'es' : ''}! Check your chats to start connecting.`
              : "We've shown you all available developers that match your profile. Try adjusting your filters or check back later!"}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRefresh}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Recommendations</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/chat'}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>View Matches</span>
            </button>
          </div>
          
          {matchCount === 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 text-sm mb-3">Pro tip: Update your profile to get better matches!</p>
              <a
                href="/profile"
                className="inline-flex items-center space-x-2 text-cyan-500 hover:text-cyan-400 text-sm font-medium"
              >
                <span>Edit Profile</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / recommendations.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Match Card */}
          <div className="relative">
            <MatchCard
              key={currentUser.id}
              user={currentUser}
              onAccept={handleAccept}
              onReject={handleReject}
            />
            
            {/* Swipe Instructions */}
            <div className="mt-8 flex justify-center space-x-8">
              <button
                onClick={() => handleReject(currentUser.id)}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-red-400 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-500/10 transition-all duration-200">
                  <X className="w-8 h-8 text-red-400 group-hover:text-red-500" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-red-400">Pass</span>
              </button>
              
              <button
                onClick={() => handleAccept(currentUser.id)}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-16 h-16 rounded-full border-2 border-emerald-400 flex items-center justify-center group-hover:border-emerald-500 group-hover:bg-emerald-500/10 transition-all duration-200">
                  <Heart className="w-8 h-8 text-emerald-400 group-hover:text-emerald-500" />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-emerald-400">Match</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Match;