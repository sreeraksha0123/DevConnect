import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Code, Loader2, X, Sparkles, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    skills: [],
    lookingFor: [],
  });
  const [skillInput, setSkillInput] = useState('');
  const [lookingForInput, setLookingForInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
    if (
      lookingForInput.trim() &&
      !formData.lookingFor.includes(lookingForInput.trim())
    ) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(
        formData.email,
        formData.password,
        formData.username,
        formData.skills,
        formData.lookingFor
      );
      navigate('/feed');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full space-y-8 animate-slide-up">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl flex items-center justify-center">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-3xl blur-xl opacity-30"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                DevConnect
              </h1>
              <p className="text-gray-500 dark:text-gray-400">Join our developer community</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create your account
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Start connecting with developers worldwide
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30 text-red-500 dark:text-red-400 rounded-xl text-sm flex items-center">
              <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
                <span className="text-red-500">!</span>
              </div>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input"
                placeholder="johndoe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="input"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="input pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Skills
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="input flex-1"
                  placeholder="React, Node.js, Python..."
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-purple-800 dark:hover:text-purple-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Looking For
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={lookingForInput}
                  onChange={(e) => setLookingForInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addLookingFor())
                  }
                  className="input flex-1"
                  placeholder="Collaboration, Mentorship, Projects..."
                />
                <button
                  type="button"
                  onClick={addLookingFor}
                  className="btn-secondary px-4"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.lookingFor.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeLookingFor(item)}
                      className="ml-1 hover:text-emerald-800 dark:hover:text-emerald-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent hover:from-purple-700 hover:to-cyan-600 transition-all"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Developer Benefits */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Why join DevConnect?</p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Connect with developers worldwide</li>
                  <li>• Find collaborators for your projects</li>
                  <li>• Get feedback on your code</li>
                  <li>• Join exclusive hackathons</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;