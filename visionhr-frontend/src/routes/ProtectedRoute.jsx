import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

/**
 * Blocks access unless the user is authenticated.
 * While the silent-refresh bootstrap is running ('loading'), renders
 * nothing (or a spinner) instead of bouncing to /login prematurely.
 */
export default function ProtectedRoute() {
  const { status } = useSelector((state) => state.auth);
  const location = useLocation();

  if (status === 'idle' || status === 'loading') {
    return <div className="flex h-screen items-center justify-center text-sm text-slate-500">Loading…</div>;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
