import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LoanTransactions() {
  return (
    <PlaceholderPage
      title="Loan Transactions"
      subtitle="Applications, approvals, disbursement, EMI, recovery, closure"
      endpoints={[
        '/transactions/loans/applications',
        '/transactions/loans/disbursement',
        '/transactions/loans/recovery',
      ]}
    />
  );
}
