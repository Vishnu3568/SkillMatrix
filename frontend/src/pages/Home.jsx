import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, HardDrive, Cpu, Terminal, CheckCircle2 } from 'lucide-react';

export default function Home() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/health');
      setHealthData(response.data);
    } catch (err) {
      setError(err.response?.data || { error: { message: 'Server connection failed.' } });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const features = [
    {
      title: 'Decoupled MVC Core',
      desc: 'Separation of routing, controllers, and database service layers.',
      icon: Cpu,
    },
    {
      title: 'Production Hardening',
      desc: 'Helmet, CORS, IP rate-limiting, and MongoDB sanitization.',
      icon: ShieldCheck,
    },
    {
      title: 'Mongoose Integration',
      desc: 'Automatic indexing, strict validation constraints, and pooled DB connections.',
      icon: HardDrive,
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
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
            padding: '6px 16px',
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
          Phase 1 Foundation Operational
        </div>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-1.5px',
            lineHeight: 1.15,
            color: 'var(--text-primary)',
            maxWidth: '800px',
          }}
        >
          Build Production-Grade Learning Systems with{' '}
          <span style={{ color: 'var(--primary)' }}>SkillMatrix</span>
        </h1>
        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            lineHeight: 1.6,
          }}
        >
          A modular Learning Management System built using React, Express.js, MongoDB, and Node.js.
          Engineered for scale, security, and high performance.
        </p>
      </section>

      {/* Grid of core features */}
      <section>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', textAlign: 'center' }}>
          Foundation Architecture Features
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="glass glass-hover" style={{ padding: '2rem', borderRadius: '12px', transition: 'var(--transition-normal)' }}>
                <div
                  style={{
                    color: 'var(--primary)',
                    background: 'var(--primary-glow)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <Icon size={24} />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Integration Verification Panel */}
      <section className="glass" style={{ padding: '2rem', borderRadius: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1.5rem',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '1.5rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={20} color="var(--primary)" />
              <span>Backend Integration Check</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
              Queries backend GET `/api/health` endpoint using Axios.
            </p>
          </div>
          <button className="btn btn-primary" onClick={fetchHealth} disabled={loading}>
            {loading ? 'Polling...' : 'Trigger Health Check'}
          </button>
        </div>

        {/* Health Data Output */}
        {loading && <p style={{ color: 'var(--text-secondary)' }}>Querying backend...</p>}
        {error && (
          <div
            style={{
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
            }}
          >
            <strong>Error contacting API:</strong> {error.error?.message || 'Check network configurations.'}
          </div>
        )}
        {healthData && (
          <div
            style={{
              padding: '1.5rem',
              borderRadius: '10px',
              background: '#070a13',
              border: '1px solid var(--border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', fontWeight: 600 }}>
              <CheckCircle2 size={18} />
              <span>{healthData.message}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status:</span>{' '}
                <span style={{ color: 'var(--secondary)' }}>Online</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Environment:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{healthData.data?.environment}</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Uptime:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{Math.floor(healthData.data?.uptime || 0)}s</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp:</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{healthData.data?.timestamp}</span>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
