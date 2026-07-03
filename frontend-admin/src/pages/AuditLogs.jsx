import PageHeader from '../components/PageHeader.jsx';

export default function AuditLogs() {
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="Cross-tenant read-only audit trail" />
      <div className="card">
        <p className="placeholder-text">
          Audit log table will load from <code>GET /api/audit-logs</code> with optional{' '}
          <code>x-company-id</code> header for tenant-scoped views.
        </p>
      </div>
    </div>
  );
}
