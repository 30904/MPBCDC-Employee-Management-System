import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function Reports() {
  return (
    <PlaceholderPage
      title="Reports"
      subtitle="Role-filtered loan and leave reports"
      endpoints={[
        'GET /api/reports/loans/*',
        'GET /api/reports/leaves/*',
      ]}
    />
  );
}
