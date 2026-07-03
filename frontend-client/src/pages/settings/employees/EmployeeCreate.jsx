import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function EmployeeCreate({ mode = 'create' }) {
  const { id } = useParams();
  const isEditMode = mode === 'edit';

  return (
    <div>
      <PageHeader
        title={isEditMode ? 'Edit Employee' : 'Create Employee'}
        subtitle={
          isEditMode
            ? `Update employee master record ${id}`
            : 'Create a new master employee record'
        }
      />
      <div className="card">
        <p className="placeholder-text">
          This screen is ready for future CRUD wiring. It will capture employee code, employee
          name, department, designation, grade, region, district, reporting manager,
          employment type, and status.
        </p>
        {isEditMode ? (
          <Link to={`/settings/employees/${id ?? 'sample-id'}`}>← Back to employee details</Link>
        ) : (
          <Link to="/settings/employees">← Back to employee list</Link>
        )}
      </div>
    </div>
  );
}