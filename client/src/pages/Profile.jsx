import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Edit, Save, X, Moon, Sun, Github, Mail, MapPin, Camera } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

// Cute bot avatars - FIXED SET (no upload)
const cuteAvatars = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robot',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Android',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Bot',
  'https://api.dicebear.com/7.x/bottts/svg?seed=AI',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Machine',
];

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    skills: [],
    lookingFor: [],
    githubUrl: '',
    avatarUrl: '',
    location: '',
  });
  
  const [skillInput, setSkillInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      // Always use bot avatars, no localStorage for custom images
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || [],
        lookingFor: user.lookingFor || [],
        githubUrl: user.githubUrl || '',
        avatarUrl: user.avatarUrl || cuteAvatars[0], // Always use first bot avatar as default
        location: user.location || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update user - avatar is already a simple URL (not Base64)
      await updateUser(formData);
      setEditing(false);
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        skills: user.skills || [],
        lookingFor: user.lookingFor || [],
        githubUrl: user.githubUrl || '',
        avatarUrl: user.avatarUrl || cuteAvatars[0], // Reset to saved/default avatar
        location: user.location || '',
      });
    }
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const addLookingFor = () => {
    if (lookingForInput.trim() && !formData.lookingFor.includes(lookingForInput.trim())) {
      setFormData({
        ...formData,
        lookingFor: [...formData.lookingFor, lookingForInput.trim()],
      });
      setLookingForInput('');
    }
  };

  const removeLookingFor = (item) => {
    setFormData({
      ...formData,
      lookingFor: formData.lookingFor.filter((l) => l !== item),
    });
  };

  // Get random bot avatar
  const getRandomBotAvatar = () => {
    const randomIndex = Math.floor(Math.random() * cuteAvatars.length);
    return cuteAvatars[randomIndex];
  };

  // Show loading state if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Your Profile
          </h1>
          <div className="flex items-center space-x-3">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Manage your developer profile</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            {/* Avatar Section - SIMPLE, NO UPLOAD */}
            <div className="relative group mb-6">
              <div className="relative w-32 h-32 mx-auto">
                <img
                  src={formData.avatarUrl}
                  alt={user.username}
                  className="w-full h-full rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl"
                />
                {editing && (
                  <button
                    onClick={() => {
                      // Get a random bot avatar
                      const randomAvatar = getRandomBotAvatar();
                      setFormData({...formData, avatarUrl: randomAvatar});
                    }}
                    className="absolute bottom-2 right-2 p-2 bg-gradient-to-r from-purple-600 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:scale-110 transition-all duration-200"
                    title="Get a random bot avatar"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              {editing && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Click <Camera className="w-3 h-3 inline mx-1" /> for a random bot avatar
                  </p>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              {editing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="text-center text-2xl font-bold w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 mb-2"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h2>
              )}
              
              <div className="flex items-center justify-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</span>
              </div>
              
              {(formData.location || editing) && (
                <div className="flex items-center justify-center space-x-2 mt-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    {editing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="text-center w-full bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-purple-500 text-sm"
                        placeholder="Add location..."
                      />
                    ) : (
                      formData.location || 'No location set'
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Simple Stats */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="text-center p-3 bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl">
                <div className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                  {formData.skills.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Skills</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl">
                <div className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
                  {formData.lookingFor.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Interests</div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-xl mb-4">
              <div className="flex items-center space-x-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-purple-500" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-500" />
                )}
                <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === 'dark' ? 'bg-purple-600' : 'bg-gray-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-500/20 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Right Column - Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              About Me
            </h3>
            {editing ? (
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 dark:text-gray-300">
                {formData.bio || 'No bio yet. Click "Edit Profile" to add one.'}
              </p>
            )}
          </div>

          {/* Skills Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Skills & Technologies
            </h3>
            {editing && (
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Add a skill..."
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-300"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm border border-purple-500/20"
                >
                  {skill}
                  {editing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      <X className="w-3 h-3 inline" />
                    </button>
                  )}
                </span>
              ))}
              {formData.skills.length === 0 && !editing && (
                <p className="text-gray-500 italic">No skills added yet</p>
              )}
            </div>
          </div>

          {/* Looking For Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Looking For
            </h3>
            {editing && (
              <div className="flex space-x-2 mb-4">
                <input
                  type="text"
                  value={lookingForInput}
                  onChange={(e) => setLookingForInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLookingFor())}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What are you looking for?"
                />
                <button
                  onClick={addLookingFor}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-all duration-300"
                >
                  Add
                </button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {formData.lookingFor.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1.5 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 text-cyan-600 dark:text-cyan-400 rounded-full text-sm border border-cyan-500/20"
                >
                  {item}
                  {editing && (
                    <button
                      onClick={() => removeLookingFor(item)}
                      className="ml-2 hover:text-cyan-800 dark:hover:text-cyan-300"
                    >
                      <X className="w-3 h-3 inline" />
                    </button>
                  )}
                </span>
              ))}
              {formData.lookingFor.length === 0 && !editing && (
                <p className="text-gray-500 italic">Nothing specified</p>
              )}
            </div>
          </div>

          {/* GitHub Section */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              GitHub Profile
            </h3>
            {editing ? (
              <input
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://github.com/username"
              />
            ) : formData.githubUrl ? (
              <a
                href={formData.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
              >
                <Github className="w-6 h-6" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{formData.githubUrl}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Click to visit GitHub</div>
                </div>
              </a>
            ) : (
              <p className="text-gray-500 italic">No GitHub link added</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;