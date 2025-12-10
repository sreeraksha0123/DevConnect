import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import Match from "./pages/Match";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";

/* -------------------------------
   🔒 PRIVATE ROUTE (Auth Required)
--------------------------------- */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        
        {/* Loading Animation */}
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center animate-pulse">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{"</>"}</span>
              </div>
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/30 to-cyan-500/30 rounded-3xl blur-xl"></div>
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">Loading your workspace...</h2>
            <p className="text-gray-400">Getting everything ready for you</p>
          </div>
          
          <div className="w-48">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/* -------------------------------
   🌐 PUBLIC ROUTE (No Auth Required)
--------------------------------- */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 relative overflow-hidden">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        
        <div className="relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/feed" /> : children;
};

/* -------------------------------
   🧭 ROUTES & MAIN LAYOUT
--------------------------------- */
function AppRoutes() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300">
        {/* Background Blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-tr from-cyan-500/10 to-emerald-500/10 blur-3xl rounded-full"></div>
        </div>

        {/* Navbar visible on all pages */}
        <Navbar />

        {/* Main Content */}
        <main className="pt-20 md:pt-16 px-4 md:px-8">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Private Routes */}
            <Route
              path="/feed"
              element={
                <PrivateRoute>
                  <Feed />
                </PrivateRoute>
              }
            />
            <Route
              path="/match"
              element={
                <PrivateRoute>
                  <Match />
                </PrivateRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <PrivateRoute>
                  <Chat />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Default Redirect */}
            <Route path="/" element={<Navigate to="/feed" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

/* -------------------------------
   🌙 MAIN APP COMPONENT
--------------------------------- */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;