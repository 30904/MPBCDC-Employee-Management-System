import ModuleSection from '../../../components/ModuleSection.jsx';

export default function RegionList() {
  return (
    <ModuleSection
      title="Regions"
      description="Regional hierarchy for transfers and holiday calendars."
      endpoints={['GET /api/regions', 'POST /api/regions', 'PUT /api/regions/:id']}
    />
  );
}
