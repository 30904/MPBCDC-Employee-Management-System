import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LeaveTypeList() {
  return (
    <ModuleSection
      title="Leave Types"
      description="Annual, casual, sick, and other leave categories."
      endpoints={['GET /api/leave-types', 'POST /api/leave-types', 'PUT /api/leave-types/:id']}
    />
  );
}
