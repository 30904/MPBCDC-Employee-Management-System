<<<<<<< HEAD
import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanDisbursement() {
  return (
    <ModuleSection
      title="Disbursement & Recovery"
      description="Post-approval disbursement, EMI schedule, and payroll recovery."
      endpoints={[
        'POST /api/loan-disbursements',
        'GET /api/loan-emi-schedules',
        'POST /api/loan-recoveries',
      ]}
    />
  );
}
=======
import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LoanDisbursement() {
  return (
    <PlaceholderPage
      title="Loan Disbursement"
      subtitle="Approved loan disbursement tracking"
      endpoints={['Loan disbursement placeholder']}
    />
  );
}
>>>>>>> origin/dev-nicole
