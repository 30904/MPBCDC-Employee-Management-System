import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function LeaveSetup() {
  return (
    <PlaceholderPage
      title="Leave Setup"
      subtitle="Leave types, holidays, accrual rules, and approval workflow"
      endpoints={[
        'CRUD /api/leave-types',
        'CRUD /api/holidays',
        'Leave accrual rules',
        'Leave approval workflow',
      ]}
    />
  );
}
