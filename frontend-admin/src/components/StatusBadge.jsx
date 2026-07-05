const STATUS_STYLES = {
  Active: 'status-badge status-badge--active',
  Inactive: 'status-badge status-badge--inactive',
};

export default function StatusBadge({ status }) {
  return <span className={STATUS_STYLES[status] || 'status-badge'}>{status || 'Unknown'}</span>;
}
