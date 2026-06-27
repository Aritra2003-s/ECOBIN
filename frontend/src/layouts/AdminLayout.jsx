import AppLayout from './AppLayout/AppLayout';

const ADMIN_NAV = [
  { label: 'Dashboard',    path: '/admin',               icon: '⊞' },
  { label: 'Users',        path: '/admin/users',         icon: '◯' },
  { label: 'Pickups',      path: '/admin/pickups',       icon: '⊕' },
  { label: 'Routes',       path: '/admin/routes',        icon: '⟳' },
  { label: 'Analytics',    path: '/admin/analytics',     icon: '▦' },
  { label: 'AI Insights',  path: '/admin/ai-insights',   icon: '✦' },
];

export default function AdminLayout() {
  return <AppLayout navItems={ADMIN_NAV} isAdmin={true} />;
}