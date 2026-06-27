const statusMap = {
  pending:     'badge-warning',
  approved:    'badge-info',
  assigned:    'badge-purple',
  in_progress: 'badge-info',
  completed:   'badge-success',
  rejected:    'badge-danger',
  cancelled:   'badge-neutral',
  resolved:    'badge-success',
  reviewed:    'badge-info',
  active:      'badge-success',
  planned:     'badge-warning',
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