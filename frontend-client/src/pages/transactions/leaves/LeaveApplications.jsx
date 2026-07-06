import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LeaveApplications() {
  return (
    <ModuleSection
      title="Leave Applications"
      description="Employee leave requests with sandwich-rule preview."
      endpoints={['GET /api/leave-applications', 'POST /api/leave-applications']}
    />
  );
}
