import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function OrganizationSetup() {
  return (
    <PlaceholderPage
      title="Organization Setup"
      subtitle="Department, Designation, Grade, Region, District masters"
      endpoints={[
        'GET/POST/PUT /api/departments',
        'Designation, Grade, Region, District CRUD APIs',
      ]}
    />
  );
}
