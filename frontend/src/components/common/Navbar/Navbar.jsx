import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

const routeTitles = {
  '/dashboard':       'Dashboard',
  '/report-waste':    'Report Waste',
  '/pickup-request':  'Request Pickup',
  '/pickup-tracking': 'Track Pickup',
  '/ai-scanner':      'AI Waste Scanner',
  '/history':         'My History',
  '/profile':         'My Profile',
  '/admin':           'Admin Dashboard',
  '/admin/users':     'User Management',
  '/admin/pickups':   'Pickup Management',
  '/admin/routes':    'Route Management',
  '/admin/analytics': 'Analytics',
  '/admin/ai-insights': 'AI Insights',
};

export default function Navbar({ isAdmin = false, onMenuToggle }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = routeTitles[pathname] || 'Ecobin';
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <header className="app-navbar">
      <div className="app-navbar__primary">
        <button className="app-navbar__menu" type="button" onClick={onMenuToggle} aria-label="Toggle navigation">
          ☰
        </button>

        <div>
          <p className="app-navbar__eyebrow">{isAdmin ? 'Admin workspace' : 'User workspace'}</p>
          
        </div>
      </div>

      <div className="app-navbar__actions">
        <div className="app-navbar__meta">

          <div className="app-navbar__user">
            <div className="app-navbar__user-copy">
              <strong>{firstName}</strong>
              <span>{user?.email || 'Signed in'}</span>
            </div>
            <div className="app-navbar__avatar">{initial}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
