import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LeaveAccrualSetup() {
  return (
    <ModuleSection
      title="Accrual Rules"
      description="Monthly/yearly accrual and carry-forward policies."
      endpoints={['GET /api/leave-accrual-rules', 'POST /api/leave-accrual-rules']}
    />
  );
}
