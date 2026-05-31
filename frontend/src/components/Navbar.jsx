import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, Award, ShieldAlert, Cpu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav class="sticky top-0 z-40 w-full border-b border-dark-800 bg-dark-950/80 backdrop-blur-md">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div class="flex items-center gap-2">
            <Link to="/" class="flex items-center gap-2 group">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
                <Terminal class="h-5 w-5 text-white" />
              </div>
              <span class="text-xl font-bold tracking-tight text-white group-hover:text-brand-400 transition-colors">
                Codex
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          {user && (
            <div class="hidden md:flex items-center gap-6">
              <Link
                to="/"
                class={`text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-brand-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Problems
              </Link>
              {user.role === 'Admin' && (
                <Link
                  to="/admin"
                  class={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-red-400' : 'text-slate-400 hover:text-red-300'
                  }`}
                >
                  <ShieldAlert class="h-4 w-4" /> Admin Panel
                </Link>
              )}
            </div>
          )}

          {/* User Profile / Actions */}
          <div class="flex items-center gap-4">
            {user ? (
              <div class="flex items-center gap-4">
                
                {/* Score */}
                <div class="flex items-center gap-1.5 rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-400 border border-brand-500/20">
                  <Award class="h-3.5 w-3.5" />
                  <span>{user.points || 0} XP</span>
                </div>

                {/* Profile Detail */}
                <div class="hidden sm:flex flex-col items-end">
                  <span class="text-sm font-semibold text-slate-200 leading-tight">{user.name}</span>
                  <span class="text-2xs text-slate-500 font-mono">{user.role}</span>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  class="flex items-center justify-center rounded-lg border border-dark-800 p-2 text-slate-400 hover:bg-dark-800 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut class="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div class="flex items-center gap-3">
                <Link
                  to="/login"
                  class="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
