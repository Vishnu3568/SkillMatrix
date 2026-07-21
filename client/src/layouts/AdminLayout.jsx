import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ROUTES } from '../constants/routes';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';

export default function AdminLayout() {
  const { logout, currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD, icon: '📊' },
    { name: 'Courses', path: '/admin/courses', icon: '📚' },
    { name: 'Lessons', path: '/admin/lessons', icon: '📝' },
    { name: 'Students', path: '/admin/students', icon: '👥' },
    { name: 'Settings', path: '/admin/settings', icon: '⚙️' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white w-64">
      {/* Sidebar Brand header */}
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800 shrink-0">
        <span className="text-xl">🎓</span>
        <span className="font-extrabold text-sm tracking-wider uppercase text-slate-200">
          Admin Console
        </span>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/10'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <span className="text-base select-none">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout foot entry */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-semibold text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition-colors"
        >
          <span className="text-base select-none">🚪</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 transition-colors duration-200">
      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar overlay drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="animate-slide-in relative flex flex-col w-64 max-w-xs bg-slate-900">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Close menu"
            >
              ✕
            </button>
            <SidebarContent />
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Workspace Panel Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-slate-900 border-b border-slate-800/80 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-label="Open navigation sidebar"
            >
              ☰
            </button>
            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:block">
              <Breadcrumbs />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Profile Avatar & Badge */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col text-right hidden sm:flex">
                <span className="text-sm font-bold text-slate-200">
                  {currentUser?.fullName}
                </span>
                <Badge variant="primary" className="self-end mt-0.5">
                  Admin
                </Badge>
              </div>
              <Avatar name={currentUser?.fullName} size="md" />
            </div>
          </div>
        </header>

        {/* Content Outlet View */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
