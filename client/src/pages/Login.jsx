import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Code, Loader2, Sparkles, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);
      console.log('✅ Login successful, user:', userData);
      navigate('/feed');
    } catch (err) {
      console.error('❌ Login failed:', err);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
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
              <p className="text-gray-500 dark:text-gray-400">Welcome back, developer!</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="card p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Sign in to your account
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Connect with developers worldwide
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </label>
              </div>
              <button type="button" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>logging in</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Log in</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                New to DevConnect?{' '}
                <Link
                  to="/register"
                  className="font-semibold bg-gradient-to-r from-purple-600 to-cyan-500 bg-clip-text text-transparent hover:from-purple-700 hover:to-cyan-600 transition-all"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Developer Note */}
          <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 border border-purple-500/20 rounded-xl">
            <div className="flex items-start space-x-3">
              <Code className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Pro tip:</span> Use your registered credentials. 
                  New users can register with their GitHub or email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;