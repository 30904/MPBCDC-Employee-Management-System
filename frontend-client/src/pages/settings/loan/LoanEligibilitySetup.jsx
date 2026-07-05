import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanEligibilitySetup() {
  return (
    <ModuleSection
      title="Eligibility Rules"
      description="Grade, tenure, and amount rules per loan type."
      endpoints={['GET /api/loan-eligibility-rules', 'POST /api/loan-eligibility-rules']}
    />
  );
}
