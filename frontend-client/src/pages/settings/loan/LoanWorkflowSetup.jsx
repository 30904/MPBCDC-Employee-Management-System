import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanWorkflowSetup() {
  return (
    <ModuleSection
      title="Approval Workflow"
      description="3-level loan approval matrix for this tenant."
      endpoints={['GET /api/approval-matrices?module=loan', 'POST /api/approval-matrices']}
    />
  );
}
