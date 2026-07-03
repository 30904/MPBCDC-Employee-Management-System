import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function LeaveBalance() {
  return (
    <PlaceholderPage
      title="Leave Balance"
      subtitle="Current leave balances by type"
      endpoints={['GET /api/leave-balances/my']}
    />
  );
}
