import ModuleSection from '../../../components/ModuleSection.jsx';

export default function LoanTypeList() {
  return (
    <ModuleSection
      title="Loan Types"
      description="Configure loan products available to employees."
      endpoints={['GET /api/loan-types', 'POST /api/loan-types', 'PUT /api/loan-types/:id']}
    />
  );
}
