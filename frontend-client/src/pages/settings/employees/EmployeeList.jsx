import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEmployees() {
      try {
        const { data } = await apiClient.get('/employees');
        if (isMounted) {
          setEmployees(data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load employee records.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

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
          Employee master records store employee code, name, department, designation, grade,
          region, district, reporting manager, employment type, status, and salary.
        </p>

        {loading && <p className="placeholder-text">Loading employees…</p>}
        {error && <div className="alert alert-warning">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="empty-state">
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.employeeCode}</td>
                      <td>{employee.employeeName}</td>
                      <td>{employee.department}</td>
                      <td>{employee.designation}</td>
                      <td>
                        {employee.reportingManager?.employeeName || employee.reportingManager?.employeeCode || '-'}
                      </td>
                      <td>
                        <span className={`status-pill status-${employee.status?.toLowerCase()}`}>
                          {employee.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <Link to={`/settings/employees/${employee.id}`}>View</Link>
                        <Link to={`/settings/employees/${employee.id}/edit`}>Edit</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
