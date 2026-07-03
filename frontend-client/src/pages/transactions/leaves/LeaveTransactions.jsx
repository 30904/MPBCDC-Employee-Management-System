import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LeaveTransactions() {
  return (
    <PlaceholderPage
      title="Leave Transactions"
      subtitle="Leave applications, approvals, and balance reports"
      endpoints={[
        '/transactions/leaves/applications',
        '/transactions/leaves/approvals',
        'GET /api/leave-balances',
      ]}
    />
  );
}
