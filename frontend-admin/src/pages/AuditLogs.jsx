import PlaceholderPage from '../components/PlaceholderPage.jsx';

export default function AuditLogs() {
  return (
    <PlaceholderPage
      title="Audit Logs"
      subtitle="Cross-tenant read-only audit trail for SUPER_ADMIN"
      endpoints={[
        'GET /api/audit-logs',
        'Optional x-company-id header for tenant-scoped audit views',
      ]}
    />
  );
}
