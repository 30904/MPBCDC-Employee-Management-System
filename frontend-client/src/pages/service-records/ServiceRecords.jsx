import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function ServiceRecords() {
  return (
    <PlaceholderPage
      title="Employee Service Records"
      subtitle="Promotion, salary revision, transfer, disciplinary, documents"
      endpoints={['POST /api/service-records/:employeeId/*']}
    />
  );
}
