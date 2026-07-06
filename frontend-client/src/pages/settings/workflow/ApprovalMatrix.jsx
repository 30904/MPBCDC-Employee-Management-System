import PageHeader from '../../../components/PageHeader.jsx';
import PlaceholderPage from '../../../components/PlaceholderPage.jsx';

export default function ApprovalMatrix() {
  return (
    <PlaceholderPage
      title="Approval Matrix"
      subtitle="Shared workflow master for loan and leave approval levels"
      endpoints={['GET/POST/PUT /api/workflow-matrix']}
    />
  );
}
