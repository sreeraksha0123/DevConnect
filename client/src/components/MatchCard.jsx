import { X, Heart, Github, Star, MapPin, Code } from 'lucide-react';
import { useState } from 'react';

const MatchCard = ({ user, onAccept, onReject }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState('');

  const handleAction = (action) => {
    setIsAnimating(true);
    setDirection(action === 'accept' ? 'right' : 'left');
    
    setTimeout(() => {
      if (action === 'accept') {
        onAccept(user.id);
      } else {
        onReject(user.id);
      }
    }, 300);
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 transition-all duration-300 hover:shadow-2xl ${
        isAnimating
          ? direction === 'right'
            ? 'translate-x-full opacity-0'
            : '-translate-x-full opacity-0'
          : ''
      }`}
    >
      <div className="flex flex-col items-center">
        {/* Avatar with Match Badge */}
        <div className="relative mb-6">
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl"
            />
            {user.matchScore > 80 && (
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-2 shadow-lg">
                <Star className="w-5 h-5 fill-current" />
              </div>
            )}
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-3xl blur-xl"></div>
        </div>

        {/* User Info */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {user.username}
        </h2>
        
        {user.title && (
          <p className="text-cyan-500 font-medium mb-2">{user.title}</p>
        )}
        
        {user.matchScore !== undefined && (
          <div className="mb-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-32 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full"
                  style={{ width: `${user.matchScore}%` }}
                ></div>
              </div>
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                {user.matchScore}%
              </span>
            </div>
          </div>
        )}

        {/* Location */}
        {user.location && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{user.location}</span>
          </div>
        )}

        {/* Bio */}
        {user.bio && (
          <p className="text-center text-gray-600 dark:text-gray-300 mb-6 line-clamp-2">
            {user.bio}
          </p>
        )}

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="w-full mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Code className="w-4 h-4 text-purple-500" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Skills
              </h3>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {user.skills.slice(0, 4).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 text-sm rounded-full border border-purple-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Link */}
        {user.githubUrl && (
          <a
            href={user.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-xl transition-all duration-300 hover:scale-105 mb-6"
          >
            <Github className="w-5 h-5" />
            <span className="text-sm">GitHub</span>
          </a>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={() => handleAction('reject')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleAction('accept')}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
          >
            <Heart className="w-6 h-6" />
          </button>
        </div>

        {/* Hint Text */}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Swipe or click buttons to match
        </p>
      </div>
    </div>
  );
};

export default MatchCard;