import ModuleSection from '../../../components/ModuleSection.jsx';

export default function HolidayList() {
  return (
    <ModuleSection
      title="Holidays"
      description="Regional and company-wide holiday calendar."
      endpoints={['GET /api/holidays', 'POST /api/holidays', 'PUT /api/holidays/:id']}
    />
  );
}
