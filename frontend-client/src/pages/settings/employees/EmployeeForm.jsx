import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const LOOKUP_OPTIONS = {
  gender: ['Male', 'Female', 'Other'],
  status: ['Active', 'Inactive'],
  employmentType: ['Permanent', 'Contract', 'Temporary', 'Probation', 'Consultant'],
  department: ['Administration', 'Finance', 'Human Resources', 'Operations', 'IT'],
  designation: ['Manager', 'Officer', 'Executive', 'Associate', 'Assistant'],
  grade: ['A', 'B', 'C', 'D'],
  region: ['North', 'South', 'East', 'West'],
  district: ['District 1', 'District 2', 'District 3', 'District 4'],
};

const initialFormState = {
  employeeCode: '',
  employeeName: '',
  gender: '',
  dateOfBirth: '',
  joiningDate: '',
  retirementDate: '',
  mobileNumber: '',
  email: '',
  aadhaarNumber: '',
  panNumber: '',
  department: '',
  designation: '',
  grade: '',
  region: '',
  district: '',
  reportingManager: '',
  employmentType: '',
  status: 'Active',
  grossSalary: '',
};

export default function EmployeeForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === 'edit';
  const [formData, setFormData] = useState(initialFormState);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const managerOptions = useMemo(
    () => employees.filter((employee) => String(employee.id) !== String(id)),
    [employees, id]
  );

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
          setError(err.response?.data?.error || 'Unable to load reporting manager options.');
        }
      }
    }

    async function loadEmployee() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await apiClient.get(`/employees/${id}`);
        const employee = data.data;

        if (isMounted) {
          setFormData({
            employeeCode: employee.employeeCode || '',
            employeeName: employee.employeeName || '',
            gender: employee.gender || '',
            dateOfBirth: employee.dateOfBirth ? employee.dateOfBirth.slice(0, 10) : '',
            joiningDate: employee.joiningDate ? employee.joiningDate.slice(0, 10) : '',
            retirementDate: employee.retirementDate ? employee.retirementDate.slice(0, 10) : '',
            mobileNumber: employee.mobileNumber || '',
            email: employee.email || '',
            aadhaarNumber: '',
            panNumber: employee.panNumber || '',
            department: employee.department || '',
            designation: employee.designation || '',
            grade: employee.grade || '',
            region: employee.region || '',
            district: employee.district || '',
            reportingManager: employee.reportingManager?.id || employee.reportingManager || '',
            employmentType: employee.employmentType || '',
            status: employee.status || 'Active',
            grossSalary: employee.grossSalary ?? '',
          });
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

    loadEmployees();
    loadEmployee();

    return () => {
      isMounted = false;
    };
  }, [id, isEditMode]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === 'panNumber' ? value.toUpperCase() : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        grossSalary: formData.grossSalary === '' ? '' : Number(formData.grossSalary),
      };

      if (isEditMode && !payload.aadhaarNumber) {
        delete payload.aadhaarNumber;
      }

      const request = isEditMode
        ? apiClient.put(`/employees/${id}`, payload)
        : apiClient.post('/employees', payload);

      const { data } = await request;
      const employee = data.data;
      navigate(`/settings/employees/${employee.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save employee record.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title={isEditMode ? 'Edit Employee' : 'Create Employee'}
          subtitle={isEditMode ? `Update employee master record ${id}` : 'Create a new master employee record'}
        />
        <div className="card">Loading employee form…</div>
      </div>
    );
  }

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
          {isEditMode
            ? 'Update the employee master record. Aadhaar is masked in the UI and remains unchanged if left blank.'
            : 'Create a new employee master record. Reporting manager must be another employee in the same company.'}
        </p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Employee Code</span>
            <input name="employeeCode" value={formData.employeeCode} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Employee Name</span>
            <input name="employeeName" value={formData.employeeName} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Gender</span>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.gender.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Date of Birth</span>
            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Joining Date</span>
            <input type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Retirement Date</span>
            <input type="date" name="retirementDate" value={formData.retirementDate} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Mobile Number</span>
            <input name="mobileNumber" inputMode="numeric" maxLength="15" value={formData.mobileNumber} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Aadhaar Number</span>
            <input
              name="aadhaarNumber"
              inputMode="numeric"
              maxLength="12"
              value={formData.aadhaarNumber}
              onChange={handleChange}
              placeholder={isEditMode ? 'Leave blank to keep existing' : '12 digits'}
              required={!isEditMode}
            />
          </label>

          <label className="form-field">
            <span>PAN Number</span>
            <input name="panNumber" value={formData.panNumber} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Department</span>
            <select name="department" value={formData.department} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.department.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Designation</span>
            <select name="designation" value={formData.designation} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.designation.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Grade</span>
            <select name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.grade.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Region</span>
            <select name="region" value={formData.region} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.region.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>District</span>
            <select name="district" value={formData.district} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.district.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Reporting Manager</span>
            <select name="reportingManager" value={formData.reportingManager} onChange={handleChange} required>
              <option value="">Select employee</option>
              {managerOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeCode} - {employee.employeeName}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Employment Type</span>
            <select name="employmentType" value={formData.employmentType} onChange={handleChange} required>
              <option value="">Select</option>
              {LOOKUP_OPTIONS.employmentType.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange} required>
              {LOOKUP_OPTIONS.status.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Gross Salary</span>
            <input type="number" min="0" name="grossSalary" value={formData.grossSalary} onChange={handleChange} required />
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving…' : isEditMode ? 'Update Employee' : 'Create Employee'}
            </button>
            {isEditMode ? (
              <Link to={`/settings/employees/${id}`}>Cancel</Link>
            ) : (
              <Link to="/settings/employees">Cancel</Link>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
