import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function LeaveHistory() {
  return (
    <PlaceholderPage
      title="Leave History"
      subtitle="View past leave applications and their status"
      endpoints={['GET /api/leave-applications (self only)']}
    />
  );
}
