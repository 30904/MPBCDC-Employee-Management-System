import PageHeader from './PageHeader.jsx';

export default function PlaceholderPage({ title, subtitle, endpoints = [] }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <div className="card">
        <p className="placeholder-text">ESS module scaffold ready — backend integration pending.</p>
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
    </div>
  );
}
