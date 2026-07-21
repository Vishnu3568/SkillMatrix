import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Container from '../components/common/Container';
import Button from '../components/common/Button';

export default function SharedLayout() {
  const location = useLocation();
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Courses', path: ROUTES.COURSES },
  ];

  if (isAuthenticated && currentUser) {
    const dashboardPath =
      currentUser.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.STUDENT_DASHBOARD;
    navLinks.push({ name: 'Dashboard', path: dashboardPath });
  } else {
    navLinks.push({ name: 'Dashboard', path: ROUTES.DASHBOARD });
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60">
        <Container className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2.5 text-base sm:text-lg font-black tracking-tight"
          >
            <span className="text-2xl animate-pulse">🎓</span>
            <span>
              Skill<span className="text-indigo-500">Matrix</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'text-indigo-400 bg-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Theme Toggler */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 focus:outline-none"
              aria-label={`Toggle theme: current is ${theme}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {isAuthenticated && currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">
                  Hello, <strong className="text-slate-200">{currentUser.fullName}</strong>
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburguer Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none"
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-800/50 bg-slate-900 px-4 py-4 flex flex-col gap-3 animate-slide-in">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold ${
                  location.pathname === link.path
                    ? 'text-indigo-400 bg-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <hr className="border-slate-800/50 my-1" />

            {isAuthenticated && currentUser ? (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs text-slate-400 px-3">
                  Signed in as: <strong>{currentUser.fullName}</strong>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    logout();
                  }}
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex gap-2 px-3">
                <Link to={ROUTES.LOGIN} onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Login
                  </Button>
                </Link>
                <Link to={ROUTES.REGISTER} onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Breadcrumbs Sub-Bar */}
      <div className="bg-slate-900/30 border-b border-slate-900/50 py-3">
        <Container>
          <Breadcrumbs />
        </Container>
      </div>

      {/* Main content */}
      <main className="flex-1 py-8">
        <Container>
          <Outlet />
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <Container>
          &copy; {new Date().getFullYear()} SkillMatrix LMS. Built with professional MERN Stack patterns.
        </Container>
      </footer>
    </div>
  );
}
