import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        gap: '1.5rem',
      }}
    >
      <div
        style={{
          color: 'var(--primary)',
          background: 'var(--primary-glow)',
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        <HelpCircle size={36} />
      </div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Page Not Found
      </h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.975rem', lineHeight: 1.6 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to={ROUTES.HOME} className="btn btn-primary" style={{ gap: '8px', marginTop: '1rem' }}>
        <ArrowLeft size={16} />
        <span>Return to Home</span>
      </Link>
    </div>
  );
}
