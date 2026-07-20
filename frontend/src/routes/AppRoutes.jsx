import { Routes, Route } from 'react-router-dom';
import SharedLayout from '../layouts/SharedLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import { ROUTES } from '../constants/routes';

// Inline placeholders for unbuilt pages to keep navigation working safely
function PlaceholderPage({ title, phase }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>
        This page module is planned and scheduled for development in **{phase}**. The underlying architecture and database schemas have already been audited.
      </p>
      <div
        style={{
          padding: '6px 14px',
          borderRadius: '6px',
          background: 'var(--border)',
          border: '1px solid var(--border)',
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginTop: '1rem',
        }}
      >
        Status: Scheduled
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<SharedLayout />}>
        {/* Core Pages */}
        <Route index element={<Home />} />
        
        {/* Navigation Placeholders */}
        <Route path={ROUTES.COURSES} element={<PlaceholderPage title="Course Discovery Catalog" phase="Phase 2 (Admin CRUD) & Phase 3 (Student Discovery)" />} />
        <Route path={ROUTES.STUDENT_DASHBOARD} element={<PlaceholderPage title="Student Dashboard" phase="Phase 4 (Enrollments) & Phase 5 (Progress)" />} />
        <Route path={ROUTES.LOGIN} element={<PlaceholderPage title="User Authentication Portal" phase="Phase 1 Follow-up / Phase 2 Setup" />} />
        <Route path={ROUTES.REGISTER} element={<PlaceholderPage title="Registration Portal" phase="Phase 1 Follow-up / Phase 2 Setup" />} />
        
        {/* 404 Route Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
