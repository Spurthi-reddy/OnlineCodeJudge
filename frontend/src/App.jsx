import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProblemWorkspace from './pages/ProblemWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div class="flex h-screen w-screen flex-col items-center justify-center bg-dark-950 text-brand-400 gap-3">
        <Loader2 class="h-10 w-10 animate-spin" />
        <span class="text-sm font-medium tracking-wide animate-pulse">Resolving secure session...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div class="flex h-screen w-screen flex-col items-center justify-center bg-dark-950 text-brand-400 gap-3">
        <Loader2 class="h-10 w-10 animate-spin" />
        <span class="text-sm font-medium tracking-wide animate-pulse">Resolving secure session...</span>
      </div>
    );
  }

  return (
    <div class="flex flex-col min-h-screen bg-dark-950 text-slate-100">
      <Navbar />
      <main class="flex-grow flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/problems/:slug"
            element={
              <ProtectedRoute>
                <ProblemWorkspace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
