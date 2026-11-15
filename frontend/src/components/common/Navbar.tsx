import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore, ThemeMode } from '../../store/useThemeStore';
import { BookOpen, Flame, GraduationCap, LayoutDashboard, Shield, Sparkles, User, LogOut, Palette } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, activeRole, setActiveRole, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const isDark = theme === 'dark-ai' || theme === 'emerald-navy';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${
      theme === 'dark-ai'
        ? 'bg-[#0b0f19]/95 border-slate-800 text-slate-100'
        : theme === 'emerald-navy'
        ? 'bg-[#060d1a]/95 border-emerald-950/80 text-slate-100'
        : 'bg-white/95 border-slate-200 text-slate-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('catalog')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${
              theme === 'emerald-navy'
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-500/20'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-xl font-black ${
                theme === 'emerald-navy'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent'
                  : theme === 'dark-ai'
                  ? 'bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'
              }`}>
                Vertexon LMS
              </span>
              <span className={`hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isDark ? 'bg-slate-800 text-blue-400 border-slate-700' : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                AI Tutor
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'catalog'
                  ? isDark ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Courses</span>
            </button>

            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                currentTab === 'dashboard'
                  ? isDark ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'
                  : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>My Learning</span>
            </button>

            {(activeRole === 'instructor' || activeRole === 'admin') && (
              <button
                onClick={() => setCurrentTab('instructor')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  currentTab === 'instructor'
                    ? isDark ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Instructor Studio</span>
              </button>
            )}

            {activeRole === 'admin' && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                  currentTab === 'admin'
                    ? isDark ? 'bg-slate-800 text-white' : 'bg-blue-50 text-blue-700'
                    : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right Actions: Live Theme Switcher + Role + Profile */}
          <div className="flex items-center space-x-3">
            {/* 🎨 Live Theme Switcher (Lets the user click and compare all 3 themes!) */}
            <div className={`flex items-center p-1 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <span className="px-2 text-slate-400 hidden xl:inline flex items-center gap-1 font-semibold">
                <Palette className="w-3 h-3" />
              </span>
              <button
                onClick={() => setTheme('minimal-light')}
                title="Clean Minimal Light Theme"
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  theme === 'minimal-light' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ☀️ Clean Light
              </button>
              <button
                onClick={() => setTheme('dark-ai')}
                title="Modern Dark AI Theme (Linear/Cursor style)"
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  theme === 'dark-ai' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌙 Dark AI
              </button>
              <button
                onClick={() => setTheme('emerald-navy')}
                title="Deep Navy & Emerald Tech Theme"
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                  theme === 'emerald-navy' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🌲 Emerald Navy
              </button>
            </div>

            {/* Quick Role Switcher */}
            <div className={`hidden lg:flex items-center p-1 rounded-xl border text-xs ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setActiveRole('student')}
                className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition ${
                  activeRole === 'student'
                    ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setActiveRole('instructor')}
                className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition ${
                  activeRole === 'instructor'
                    ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Instructor
              </button>
              <button
                onClick={() => setActiveRole('admin')}
                className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition ${
                  activeRole === 'admin'
                    ? isDark ? 'bg-slate-800 text-white' : 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin
              </button>
            </div>

            {/* User Profile */}
            {user ? (
              <div className="flex items-center space-x-2">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-slate-400 object-cover"
                />
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
