import AppLayout from './AppLayout/AppLayout';

const USER_NAV = [
  { label: 'Dashboard',      path: '/dashboard',       icon: '⊞' },
  { label: 'Report Waste',    path: '/report-waste',    icon: '⚑' },
  { label: 'Request Pickup',  path: '/pickup-request',  icon: '⊕' },
  { label: 'Track Pickup',    path: '/pickup-tracking', icon: '◎' },
  { label: 'AI Scanner',      path: '/ai-scanner',      icon: '✦' },
  { label: 'History',         path: '/history',         icon: '≡' },
  { label: 'Profile',         path: '/profile',         icon: '◯' },
];

export default function UserLayout() {
  return <AppLayout navItems={USER_NAV} isAdmin={false} />;
}