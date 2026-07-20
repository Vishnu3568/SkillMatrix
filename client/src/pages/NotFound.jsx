import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 1.5rem',
        gap: '1.5rem',
      }}
    >
      <div style={{ fontSize: '3rem' }}>❓</div>
      <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.975rem', lineHeight: 1.6 }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Return Home
      </Link>
    </div>
  );
}
