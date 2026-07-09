import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../api/apiClient.js';
import {
  fetchDepartments,
  fetchDesignations,
  fetchDistricts,
  fetchGrades,
  fetchRegions,
} from '../../../api/organizationMastersApi.js';
import PageHeader from '../../../components/PageHeader.jsx';

const LOOKUP_OPTIONS = {
  gender: ['Male', 'Female', 'Other'],
  status: ['Active', 'Inactive'],
  employmentType: ['Permanent', 'Contract', 'Temporary', 'Probation', 'Consultant'],
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
  password: '',
  confirmPassword: '',
};

function toSelectOptions(items, valueSelector, labelSelector) {
  return items
    .map((item) => ({
      value: valueSelector(item),
      label: labelSelector(item),
    }))
    .filter((item) => item.value);
}

function withCurrentValue(options, currentValue) {
  if (!currentValue) {
    return options;
  }

  if (options.some((option) => option.value === currentValue)) {
    return options;
  }

  return [
    {
      value: currentValue,
      label: `Current: ${currentValue}`,
    },
    ...options,
  ];
}

export default function EmployeeForm({ mode = 'create' }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === 'edit';
  const [formData, setFormData] = useState(initialFormState);
  const [employees, setEmployees] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [gradeOptions, setGradeOptions] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const managerOptions = useMemo(
    () => employees.filter((employee) => String(employee.id) !== String(id)),
    [employees, id]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const requests = [
        apiClient.get('/employees'),
        fetchDepartments(),
        fetchDesignations(),
        fetchGrades(),
        fetchRegions(),
        fetchDistricts(),
      ];

      if (isEditMode) {
        requests.push(apiClient.get(`/employees/${id}`));
      }

      const results = await Promise.allSettled(requests);
      const [
        employeesResult,
        departmentsResult,
        designationsResult,
        gradesResult,
        regionsResult,
        districtsResult,
        employeeResult,
      ] = results;

      if (!isMounted) {
        return;
      }

      const errors = [];

      if (employeesResult.status === 'fulfilled') {
        setEmployees(employeesResult.value.data.data ?? []);
      } else {
        errors.push(employeesResult.reason?.response?.data?.error || 'Unable to load reporting manager options.');
      }

      if (departmentsResult.status === 'fulfilled') {
        setDepartmentOptions(
          toSelectOptions(
            departmentsResult.value,
            (item) => item.name,
            (item) => item.name
          )
        );
      } else {
        errors.push(departmentsResult.reason?.response?.data?.error || 'Unable to load departments.');
      }

      if (designationsResult.status === 'fulfilled') {
        setDesignationOptions(
          toSelectOptions(
            designationsResult.value,
            (item) => item.name,
            (item) => `${item.code ? `${item.code} - ` : ''}${item.name}`
          )
        );
      } else {
        errors.push(designationsResult.reason?.response?.data?.error || 'Unable to load designations.');
      }

      if (gradesResult.status === 'fulfilled') {
        setGradeOptions(
          toSelectOptions(
            gradesResult.value,
            (item) => item.code,
            (item) => `${item.code ? `${item.code} - ` : ''}${item.name}`
          )
        );
      } else {
        errors.push(gradesResult.reason?.response?.data?.error || 'Unable to load grades.');
      }

      if (regionsResult.status === 'fulfilled') {
        setRegionOptions(
          toSelectOptions(
            regionsResult.value,
            (item) => item.name,
            (item) => `${item.code ? `${item.code} - ` : ''}${item.name}`
          )
        );
      } else {
        errors.push(regionsResult.reason?.response?.data?.error || 'Unable to load regions.');
      }

      if (districtsResult.status === 'fulfilled') {
        setDistrictOptions(
          toSelectOptions(
            districtsResult.value,
            (item) => item.name,
            (item) => `${item.code ? `${item.code} - ` : ''}${item.name}`
          )
        );
      } else {
        errors.push(districtsResult.reason?.response?.data?.error || 'Unable to load districts.');
      }

      if (isEditMode) {
        if (employeeResult.status === 'fulfilled') {
          const employee = employeeResult.value.data.data;
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
        } else {
          errors.push(employeeResult.reason?.response?.data?.error || 'Unable to load employee record.');
        }
      }

      if (errors.length > 0) {
        setError(errors[0]);
      }

      setLoading(false);
    }

    loadData();

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

    if (!isEditMode && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        grossSalary: formData.grossSalary === '' ? '' : Number(formData.grossSalary),
      };

      delete payload.password;
      delete payload.confirmPassword;

      if (isEditMode && !payload.aadhaarNumber) {
        delete payload.aadhaarNumber;
      }

      if (!isEditMode && managerOptions.length === 0) {
        delete payload.reportingManager;
      }

      const request = isEditMode
        ? apiClient.put(`/employees/${id}`, payload)
        : apiClient.post('/employees/with-account', {
            ...payload,
            password: formData.password,
          });

      const { data } = await request;
      const employee = isEditMode ? data.data : data.data.employee;
      navigate(`/settings/employees/${employee.id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save employee record.');
    } finally {
      setSaving(false);
    }
  }

  function renderOptions(options, currentValue) {
    return withCurrentValue(options, currentValue).map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ));
  }

  if (loading) {
    return (
      <div>
        <PageHeader
          title={isEditMode ? 'Edit Employee' : 'Create Employee'}
          subtitle={isEditMode ? `Update employee master record ${id}` : 'Create a new master employee record'}
        />
        <div className="card">Loading employee form...</div>
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
            : 'Create a new employee master record and ESS login. Employee code is used as the login ID.'}
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
                <option key={option} value={option}>
                  {option}
                </option>
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
            <input
              name="mobileNumber"
              inputMode="numeric"
              maxLength="15"
              value={formData.mobileNumber}
              onChange={handleChange}
              required
            />
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
              {renderOptions(departmentOptions, formData.department)}
            </select>
          </label>

          <label className="form-field">
            <span>Designation</span>
            <select name="designation" value={formData.designation} onChange={handleChange} required>
              <option value="">Select</option>
              {renderOptions(designationOptions, formData.designation)}
            </select>
          </label>

          <label className="form-field">
            <span>Grade</span>
            <select name="grade" value={formData.grade} onChange={handleChange} required>
              <option value="">Select</option>
              {renderOptions(gradeOptions, formData.grade)}
            </select>
          </label>

          <label className="form-field">
            <span>Region</span>
            <select name="region" value={formData.region} onChange={handleChange} required>
              <option value="">Select</option>
              {renderOptions(regionOptions, formData.region)}
            </select>
          </label>

          <label className="form-field">
            <span>District</span>
            <select name="district" value={formData.district} onChange={handleChange} required>
              <option value="">Select</option>
              {renderOptions(districtOptions, formData.district)}
            </select>
          </label>

          <label className="form-field">
            <span>Reporting Manager</span>
            <select
              name="reportingManager"
              value={formData.reportingManager}
              onChange={handleChange}
              required={managerOptions.length > 0}
            >
              <option value="">
                {managerOptions.length > 0 ? 'Select employee' : 'Not required for first employee'}
              </option>
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
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange} required>
              {LOOKUP_OPTIONS.status.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Gross Salary</span>
            <input
              type="number"
              min="0"
              name="grossSalary"
              value={formData.grossSalary}
              onChange={handleChange}
              required
            />
          </label>

          {!isEditMode && (
            <>
              <label className="form-field">
                <span>ESS Password</span>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </label>

              <label className="form-field">
                <span>Confirm Password</span>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                />
              </label>
            </>
          )}

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
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
