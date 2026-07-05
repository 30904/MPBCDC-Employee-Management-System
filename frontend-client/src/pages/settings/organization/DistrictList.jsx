import ModuleSection from '../../../components/ModuleSection.jsx';

export default function DistrictList() {
  return (
    <ModuleSection
      title="Districts"
      description="District master linked to regions."
      endpoints={['GET /api/districts', 'POST /api/districts', 'PUT /api/districts/:id']}
    />
  );
}
