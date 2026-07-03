import PlaceholderPage from '../components/PlaceholderPage.jsx';

export default function Notifications() {
  return (
    <PlaceholderPage
      title="Notifications"
      subtitle="In-app inbox for leave, loan, and system alerts"
      endpoints={['GET /api/notifications']}
    />
  );
}
