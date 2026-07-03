import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function EmployeeList() {
  return (
    <div>
      <PageHeader
        title="Employee Management"
        subtitle="Master employee records used across the HRMS"
        action={
          <Link to="/settings/employees/create" className="primary-btn">
            + Create Employee
          </Link>
        }
      />
      <div className="card">
        <p className="placeholder-text">
          Employee master records will store employee code, name, department, designation,
          grade, region, district, reporting manager, employment type, and status.
        </p>
        <div className="card-grid">
          <Link className="card nav-card" to="/settings/employees/create">
            <h3>Create Employee</h3>
            <p>Prepare a new master employee profile.</p>
          </Link>
          <Link className="card nav-card" to="/settings/employees/sample-id">
            <h3>Employee Details</h3>
            <p>Review a master record before edits are available.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
