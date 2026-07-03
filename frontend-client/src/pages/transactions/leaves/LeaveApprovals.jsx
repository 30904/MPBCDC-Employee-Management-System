import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LeaveApprovals() {
  return (
    <ModuleSection
      title="Approver Queue"
      description="Pending leave requests for managers and HR."
      endpoints={['GET /api/leave-applications?status=pending', 'POST /api/leave-approvals']}
    />
  );
}
