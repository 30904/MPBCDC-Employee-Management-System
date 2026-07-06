const STATUS_STYLES = {
  Active: 'status-badge status-badge--active',
  Inactive: 'status-badge status-badge--inactive',
};

export default function StatusBadge({ status }) {
  const label = status === true || status === 'Active' ? 'Active' : 'Inactive';
  const styleKey = label;

  return <span className={STATUS_STYLES[styleKey] || 'status-badge'}>{label}</span>;
}
