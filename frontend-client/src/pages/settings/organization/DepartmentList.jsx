import ModuleSection from '../../../components/ModuleSection.jsx';

export default function DepartmentList() {
  return (
    <ModuleSection
      title="Departments"
      description="Org master — department list and CRUD."
      endpoints={['GET /api/departments', 'POST /api/departments', 'PUT /api/departments/:id']}
    />
  );
}
