import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import Navbar from '../../components/common/Navbar/Navbar';
import './AppLayout.css';

export default function AppLayout({ navItems, isAdmin = false }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Manage body scroll/class
  useEffect(() => {
    document.body.classList.toggle('menu-open', isSidebarOpen);
    return () => document.body.classList.remove('menu-open');
  }, [isSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="app-layout">
      <Sidebar
        navItems={navItems}
        isAdmin={isAdmin}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onNavigate={closeSidebar}
      />

      {isSidebarOpen && (
        <button 
          className="app-layout__overlay" 
          type="button" 
          onClick={closeSidebar} 
          aria-label="Close navigation" 
        />
      )}

      <div className="app-layout__main">
        <Navbar isAdmin={isAdmin} onMenuToggle={toggleSidebar} />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}