import ModuleSection from '../../../components/ModuleSection.jsx';

export default function DesignationList() {
  return (
    <ModuleSection
      title="Designations"
      description="Job titles and designation master data."
      endpoints={['GET /api/designations', 'POST /api/designations', 'PUT /api/designations/:id']}
    />
  );
}
