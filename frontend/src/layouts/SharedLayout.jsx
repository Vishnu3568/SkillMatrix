import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { GraduationCap, LayoutDashboard, LogIn, Compass } from 'lucide-react';

export default function SharedLayout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME, icon: Compass },
    { name: 'Courses', path: ROUTES.COURSES, icon: GraduationCap },
    { name: 'Dashboard', path: ROUTES.STUDENT_DASHBOARD, icon: LayoutDashboard },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header */}
      <header
        className="glass"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'var(--bg-nav)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            height: '70px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo Brand */}
          <Link
            to={ROUTES.HOME}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              color: 'var(--text-primary)',
            }}
          >
            <div
              style={{
                background: 'var(--primary)',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-glow)',
              }}
            >
              <GraduationCap size={20} color="#ffffff" />
            </div>
            <span>
              Skill<span style={{ color: 'var(--primary)' }}>Matrix</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    border: isActive ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  <Icon size={16} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Login Placeholder */}
          <div>
            <Link
              to={ROUTES.LOGIN}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px' }}
            >
              <LogIn size={16} />
              <span>Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main View Shell */}
      <main style={{ flex: 1, padding: '2.5rem 0' }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '1.5rem 0',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="container">
          &copy; {new Date().getFullYear()} SkillMatrix LMS. Built for production scale.
        </div>
      </footer>
    </div>
  );
}
