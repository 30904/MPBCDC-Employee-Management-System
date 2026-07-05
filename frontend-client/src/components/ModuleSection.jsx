export default function ModuleSection({ title, description, endpoints = [] }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {description && <p className="placeholder-text">{description}</p>}
      <p className="placeholder-text">Implementation pending backend APIs for this tenant.</p>
      {endpoints.length > 0 && (
        <ul className="endpoint-list">
          {endpoints.map((endpoint) => (
            <li key={endpoint}>
              <code>{endpoint}</code>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
