import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../common/Loader/Loader';

// Redirects unauthenticated users to /login.
// Shows a fullscreen loader during the initial auth check.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Loader fullscreen />;
  if (!user)   return <Navigate to="/login" replace />;

  return <Outlet />;
}