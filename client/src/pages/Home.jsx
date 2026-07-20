export default function Home() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero */}
      <section
        style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            background: 'var(--primary-glow)',
            color: 'var(--primary)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Phase 1 Foundation Ready
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            color: 'var(--text-primary)',
            maxWidth: '800px',
            lineHeight: 1.1,
          }}
        >
          Welcome to the <span style={{ color: 'var(--primary)' }}>SkillMatrix</span> LMS Foundation
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}
        >
          A production-grade Learning Management System architecture. The project foundation has been
          fully initialized, configured with robust security middleware, structured logging, and workspace utilities.
        </p>
      </section>

      {/* Info Cards */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}
      >
        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🛡️</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Security Hardened
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Configured with Helmet headers, CORS parameters, rate limiting, and request sanitization.
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🪵</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Structured Logging
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Pino and Pino-HTTP logging framework configured to output structured traces cleanly.
          </p>
        </div>

        <div className="glass" style={{ padding: '2rem', borderRadius: '12px' }}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>⚙️</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Workspace Utilities
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
            Includes central error interceptors, reusable formatting classes, constants, and slug algorithms.
          </p>
        </div>
      </section>
    </div>
  );
}
