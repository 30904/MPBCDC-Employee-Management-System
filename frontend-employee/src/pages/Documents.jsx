import PlaceholderPage from '../components/PlaceholderPage.jsx';

export default function Documents() {
  return (
    <PlaceholderPage
      title="My Documents"
      subtitle="View your own uploaded documents only"
      endpoints={['GET /api/employees/me/documents']}
    />
  );
}
