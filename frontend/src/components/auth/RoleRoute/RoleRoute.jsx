import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

export default function RoleRoute({ allowedRole }) {
  const { user, loading } = useAuth(); // Assuming your context provides a loading state

  // 1. Wait for auth check to complete
  if (loading) {
    return <div className="loading-spinner">Loading...</div>; 
  }

  // 2. If not logged in at all, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 3. If logged in but the role is wrong
  if (user.role !== allowedRole) {
    console.warn(`Access denied: Required ${allowedRole}, but user is ${user.role}`);
    
    // Redirect to their own valid dashboard instead of just blocking them
    const redirectPath = user.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // 4. Authorized! Render the layout/page
  return <Outlet />;
}