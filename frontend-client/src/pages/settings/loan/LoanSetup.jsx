import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LoanSetup() {
  return (
    <PlaceholderPage
      title="Loan Setup"
      subtitle="Loan types, eligibility rules, and approval workflow configuration"
      endpoints={[
        'CRUD /api/loan-types',
        'Loan eligibility configuration',
        'Loan approval workflow setup',
      ]}
    />
  );
}
