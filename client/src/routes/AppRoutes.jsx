import { Routes, Route } from 'react-router-dom';
import SharedLayout from '../layouts/SharedLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import { ROUTES } from '../constants/routes';

function PagePlaceholder({ name, phase }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{name}</h2>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.6 }}>
        The {name} feature is planned and scheduled for implementation during **{phase}**. The base architecture has been set up.
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
        <Route index element={<Home />} />
        <Route path={ROUTES.COURSES} element={<PagePlaceholder name="Courses Catalog" phase="Phase 2 (Course/Lesson CRUD) & Phase 3 (Discovery)" />} />
        <Route path={ROUTES.DASHBOARD} element={<PagePlaceholder name="Student/Admin Dashboard" phase="Phase 5 (Progress) & Phase 6 (Dashboards)" />} />
        <Route path={ROUTES.LOGIN} element={<PagePlaceholder name="Authentication Portal" phase="Phase 2 (Auth implementation)" />} />
        <Route path={ROUTES.REGISTER} element={<PagePlaceholder name="Registration Portal" phase="Phase 2 (Auth implementation)" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
