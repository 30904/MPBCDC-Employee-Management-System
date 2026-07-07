import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

export default function EmployeeDetails() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadEmployee() {
      try {
        const { data } = await apiClient.get(`/employees/${id}`);
        if (isMounted) {
          setEmployee(data.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load employee record.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Employee Details" subtitle={`Master employee record: ${id}`} />
        <div className="card">Loading employee record…</div>
      </div>
    );
  }

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
        {error && <div className="alert alert-warning">{error}</div>}

        {employee && (
          <>
            <h3>Record Summary</h3>
            <p className="placeholder-text">
              Read-only master profile view. Aadhaar is masked and company scope remains hidden.
            </p>
            <div className="detail-grid">
              <div><strong>Employee Code</strong><span>{employee.employeeCode}</span></div>
              <div><strong>Employee Name</strong><span>{employee.employeeName}</span></div>
              <div><strong>Gender</strong><span>{employee.gender}</span></div>
              <div><strong>Date of Birth</strong><span>{employee.dateOfBirth?.slice(0, 10)}</span></div>
              <div><strong>Joining Date</strong><span>{employee.joiningDate?.slice(0, 10)}</span></div>
              <div><strong>Retirement Date</strong><span>{employee.retirementDate?.slice(0, 10)}</span></div>
              <div><strong>Mobile Number</strong><span>{employee.mobileNumber}</span></div>
              <div><strong>Email</strong><span>{employee.email}</span></div>
              <div><strong>Aadhaar</strong><span>{employee.aadhaarNumberMasked}</span></div>
              <div><strong>PAN</strong><span>{employee.panNumber}</span></div>
              <div><strong>Department</strong><span>{employee.department}</span></div>
              <div><strong>Designation</strong><span>{employee.designation}</span></div>
              <div><strong>Grade</strong><span>{employee.grade}</span></div>
              <div><strong>Region</strong><span>{employee.region}</span></div>
              <div><strong>District</strong><span>{employee.district}</span></div>
              <div>
                <strong>Reporting Manager</strong>
                <span>
                  {employee.reportingManager?.employeeName
                    ? `${employee.reportingManager.employeeName} (${employee.reportingManager.employeeCode})`
                    : '-'}
                </span>
              </div>
              <div><strong>Employment Type</strong><span>{employee.employmentType}</span></div>
              <div><strong>Status</strong><span>{employee.status}</span></div>
              <div><strong>Gross Salary</strong><span>{employee.grossSalary}</span></div>
            </div>
          </>
        )}

        <p className="back-link">
          <Link to="/settings/employees">← Back to employee management</Link>
        </p>
      </div>
    </div>
  );
}