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
