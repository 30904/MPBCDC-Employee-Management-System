import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function EmployeeDetails() {
  const { id } = useParams();

  return (
    <div>
      <PageHeader
        title="Employee Details"
        subtitle={`Master employee record: ${id}`}
        action={
          <Link to={`/settings/employees/${id}/edit`} className="primary-btn">
            Edit Employee
          </Link>
        }
      />
      <div className="card">
        <h3>Record Summary</h3>
        <p className="placeholder-text">
          This placeholder screen will show the employee master profile and allow future edit
          workflows.
        </p>
        <ul className="endpoint-list">
          <li>Employee Code</li>
          <li>Employee Name</li>
          <li>Department</li>
          <li>Designation</li>
          <li>Grade</li>
          <li>Region</li>
          <li>District</li>
          <li>Reporting Manager</li>
          <li>Employment Type</li>
          <li>Status</li>
        </ul>
        <Link to="/settings/employees">← Back to employee management</Link>
      </div>
    </div>
  );
}