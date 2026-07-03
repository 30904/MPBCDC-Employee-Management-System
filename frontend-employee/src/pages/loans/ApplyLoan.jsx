import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function ApplyLoan() {
  return (
    <PlaceholderPage
      title="Apply Loan"
      subtitle="Submit a new loan application with eligibility preview"
      endpoints={['POST /api/loan-applications', 'GET /api/loans/preview-eligibility']}
    />
  );
}
