export default function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </header>
  );
}
