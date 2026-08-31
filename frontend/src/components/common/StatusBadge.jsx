const statusMap = {
  pending:     'badge-warning',
  approved:    'badge-teal',
  assigned:    'badge-teal',
  in_progress: 'badge-info',
  completed:   'badge-success',
  rejected:    'badge-danger',
  cancelled:   'badge-neutral',
  resolved:    'badge-success',
  reviewed:    'badge-teal',
  active:      'badge-success',
  planned:     'badge-warning',
  available:   'badge-success',
  on_route:    'badge-teal',
  maintenance: 'badge-warning',
  low:         'badge-success',
  medium:      'badge-warning',
  high:        'badge-danger',
  critical:    'badge-danger',
};

export default function StatusBadge({ status }) {
  const cls = statusMap[status] || 'badge-neutral';
  return (
    <span className={`badge ${cls}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}