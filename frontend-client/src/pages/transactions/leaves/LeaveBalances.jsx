import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LeaveBalances() {
  return (
    <ModuleSection
      title="Leave Balances"
      description="Tenant-wide balance ledger and period reports."
      endpoints={['GET /api/leave-balances', 'GET /api/leave-balances?employeeId=:id']}
    />
  );
}
