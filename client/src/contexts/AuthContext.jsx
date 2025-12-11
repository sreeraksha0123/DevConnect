import { createContext, useContext, useState, useEffect } from 'react';
import { initSocket, disconnectSocket } from '../utils/socket';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      console.log('🔄 Auth init - Token exists:', !!storedToken);
      
      if (!storedToken) {
        setLoading(false);
        return;
      }
      
      try {
        // FIXED URL: Changed from /auth/me to /api/auth/me
        const response = await fetch('http://localhost:5000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        
        console.log('Auth me response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Auth check failed`);
        }
        
        const data = await response.json();
        console.log('✅ User data loaded:', data.user?.username);
        
        setUser(data.user);
        setToken(storedToken);
        
        // Initialize socket AFTER user is confirmed
        if (data.user) {
          initSocket(storedToken);
        }
        
        setError(null);
      } catch (error) {
        console.error('❌ Auth init error:', error.message);
        
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setError('Session expired. Please login again.');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    console.log('🔐 Login attempt for:', email);
    
    try {
      // FIXED URL: Changed from /auth/login to /api/auth/login
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('📡 Login response status:', response.status);
      
      // Get raw response first
      const responseText = await response.text();
      console.log('📦 Raw login response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText.substring(0, 100)}`);
      }
      
      // Parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}`);
      }
      
      console.log('✅ Login data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response: missing token or user data');
      }
      
      // Store data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Update state
      setToken(data.token);
      setUser(data.user);
      
      // Initialize socket
      initSocket(data.token);
      
      console.log('🎉 Login successful for:', data.user.username);
      return { success: true, user: data.user };
      
    } catch (err) {
      console.error('❌ Login catch error:', err);
      
      let errorMessage;
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to backend. Is it running on localhost:5000?';
      } else if (err.message.includes('401')) {
        errorMessage = 'Invalid email or password';
      } else if (err.message.includes('404')) {
        errorMessage = 'Backend route not found. Check if server is running.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Backend returned invalid response';
      } else {
        errorMessage = err.message || 'Login failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, username, skills = [], lookingFor = []) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📝 Registration attempt:', { email, username });
      
      // FIXED URL: Changed from /auth/register to /api/auth/register
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          username,
          skills,
          lookingFor,
        })
      });
      
      console.log('Register response status:', response.status);
      
      const responseText = await response.text();
      console.log('Raw register response:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      const data = JSON.parse(responseText);
      
      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }
      
      // Store data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setToken(data.token);
      setUser(data.user);
      
      // Initialize socket
      initSocket(data.token);
      
      console.log('✅ Registration successful for:', data.user.username);
      return data.user;
      
    } catch (err) {
      console.error('❌ Register error:', err);
      
      let errorMessage;
      if (err.message.includes('409')) {
        errorMessage = 'Email or username already exists';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Cannot connect to server';
      } else if (err.message.includes('404')) {
        errorMessage = 'Registration route not found. Check if server is running.';
      } else {
        errorMessage = err.message || 'Registration failed';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    
    // Clear storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Update state
    setToken(null);
    setUser(null);
    setError(null);
    
    // Disconnect socket
    disconnectSocket();
    
    console.log('✅ Logged out');
    
    // Force redirect to login
    window.location.href = '/login';
  };

  const updateUser = async (updatedUser) => {
    try {
      const token = localStorage.getItem('token');
      
      // FIXED URL: Changed from /users/profile to /api/users/profile
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedUser)
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(data.data));
        setUser(data.data);
        return data.data;
      }
      
      throw new Error(data.message || 'Update failed');
      
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};