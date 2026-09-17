import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Restricts a subtree to specific roles. Must be nested inside
 * <ProtectedRoute/> so state.auth.user is guaranteed to exist.
 * Usage: <Route element={<RoleGuard allow={['HR','SuperAdmin']} />}>...</Route>
 */
export default function RoleGuard({ allow = [] }) {
  const { user } = useSelector((state) => state.auth);

  if (!user || !allow.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
