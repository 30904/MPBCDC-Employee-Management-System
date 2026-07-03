import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function ApplyLeave() {
  return (
    <PlaceholderPage
      title="Apply Leave"
      subtitle="Submit a new leave application"
      endpoints={['POST /api/leave-applications', 'leaveCalculationService — days & sandwich rule']}
    />
  );
}
