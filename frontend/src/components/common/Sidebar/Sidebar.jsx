import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import './Sidebar.css';

export default function Sidebar({ navItems, isAdmin = false, isOpen = false, onClose, onNavigate: onNavigateProp }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  const handleNavigate = () => {
    onNavigateProp?.();
  };

  const handleProfileClick = () => {
    onNavigateProp?.();
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login');
  };

  return (
    <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
      <div className="app-sidebar__header">
        <div className="app-sidebar__brand-row">
          <div className="app-sidebar__brand">
            <div className="app-sidebar__brand-mark">
               <img src="assets/logo.png" alt="Ecobin Logo" />
            </div>
            <div className="app-sidebar__brand-copy">
              <strong>Ecobin</strong>
              <span>{isAdmin ? 'Admin Portal' : 'User Portal'}</span>
            </div>
          </div>

          <button className="app-sidebar__close" type="button" onClick={onClose} aria-label="Close navigation">
            ✕
          </button>
        </div>
      </div>

      <div className="app-sidebar__profile">
        <div className="app-sidebar__profile-card" onClick={handleProfileClick}>
          <div className="app-sidebar__avatar">{initial}</div>
          <div className="app-sidebar__profile-copy">
            <strong>{user?.name || 'User'}</strong>
            <span>{user?.email || 'No email available'}</span>
          </div>
        </div>
      </div>

      <nav className="app-sidebar__nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard' || item.path === '/admin'}
            className={({ isActive }) =>
              `app-sidebar__link ${isActive ? 'app-sidebar__link--active' : ''}`
            }
            onClick={handleNavigate}
          >
            <span className="app-sidebar__link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="app-sidebar__footer">
        <button className="btn app-sidebar__logout" onClick={handleLogout}>
          <span>⎋</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
