import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center' }}>
      <Outlet />
    </div>
  );
}
