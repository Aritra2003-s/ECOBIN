import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import Loader from '../../common/Loader/Loader';

export default function RoleRoute({ allowedRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 1. Wait for auth check to complete
  if (loading) {
    return <Loader fullscreen message="Verifying security credentials..." />;
  }

  // 2. If not logged in, redirect to login with return path
  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // 3. Normalize user role
  const userRole = (user.role || 'user').toLowerCase();
  const requiredRole = (allowedRole || 'user').toLowerCase();

  // 4. If logged in but role mismatch
  if (userRole !== requiredRole) {
    console.warn(`Access denied to ${location.pathname}: Required ${requiredRole}, but user role is ${userRole}`);
    
    // Redirect to their respective authorized root
    const redirectPath = userRole === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // 5. Authorized! Render protected layout/page
  return <Outlet />;
}