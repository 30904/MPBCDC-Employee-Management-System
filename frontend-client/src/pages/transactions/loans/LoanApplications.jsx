<<<<<<< HEAD
import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanApplications() {
  return (
    <ModuleSection
      title="Loan Applications"
      description="Incoming employee loan requests and status tracking."
      endpoints={['GET /api/loan-applications', 'GET /api/loan-applications/:id']}
    />
  );
}
=======
import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LoanApplications() {
  return (
    <PlaceholderPage
      title="Loan Applications"
      subtitle="Submitted loan application queue"
      endpoints={['Loan applications placeholder']}
    />
  );
}
>>>>>>> origin/dev-nicole
