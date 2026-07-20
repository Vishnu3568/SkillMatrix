import { Outlet, Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function SharedLayout() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Courses', path: ROUTES.COURSES },
    { name: 'Dashboard', path: ROUTES.DASHBOARD },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
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
          {/* Logo */}
          <Link
            to={ROUTES.HOME}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
            }}
          >
            <span style={{ color: 'var(--primary)' }}>🎓</span>
            <span>
              Skill<span style={{ color: 'var(--primary)' }}>Matrix</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav style={{ display: 'flex', gap: '8px' }}>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    background: isActive ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    transition: 'var(--transition-fast)',
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Auth link */}
          <div>
            <Link
              to={ROUTES.LOGIN}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '0.875rem' }}
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
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
          &copy; {new Date().getFullYear()} SkillMatrix LMS. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
