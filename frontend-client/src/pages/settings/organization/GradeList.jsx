import ModuleSection from '../../../components/ModuleSection.jsx';

export default function GradeList() {
  return (
    <ModuleSection
      title="Grades"
      description="Employee grade / level master."
      endpoints={['GET /api/grades', 'POST /api/grades', 'PUT /api/grades/:id']}
    />
  );
}
