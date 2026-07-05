import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanApprovals() {
  return (
    <ModuleSection
      title="Approver Queue"
      description="Pending loan approvals for HR, Finance, and Managers."
      endpoints={['GET /api/loan-applications?status=pending', 'POST /api/loan-approvals']}
    />
  );
}
