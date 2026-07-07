import { useEffect, useMemo, useState } from 'react';
import apiClient from '../../../api/apiClient.js';
import PageHeader from '../../../components/PageHeader.jsx';

const initialFormState = {
  name: '',
  headEmployeeId: '',
  effectiveDate: '',
  status: 'Active',
};

function formatDate(value) {
  if (!value) {
    return '-';
  }

  return String(value).slice(0, 10);
}

export default function DepartmentMaster() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(editingId);
  const employeeOptions = useMemo(() => employees, [employees]);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [departmentResponse, employeeResponse] = await Promise.all([
          apiClient.get('/departments'),
          apiClient.get('/employees'),
        ]);

        if (isMounted) {
          setDepartments(departmentResponse.data.data ?? []);
          setEmployees(employeeResponse.data.data ?? []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load department master data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setFormData(initialFormState);
    setEditingId(null);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleEditDepartment(department) {
    setEditingId(department.id);
    setFormData({
      name: department.name || '',
      headEmployeeId: department.headEmployeeId?.id || department.headEmployeeId || '',
      effectiveDate: formatDate(department.effectiveDate),
      status: department.status || 'Active',
    });
    setError('');
  }

  async function refreshDepartments() {
    const { data } = await apiClient.get('/departments');
    setDepartments(data.data ?? []);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        headEmployeeId: formData.headEmployeeId || null,
      };

      const request = isEditing
        ? apiClient.put(`/departments/${editingId}`, payload)
        : apiClient.post('/departments', payload);

      await request;
      await refreshDepartments();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save department.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Department Master"
        subtitle="Manage company department records"
        action={
          <button type="button" className="primary-btn" onClick={resetForm}>
            + New Department
          </button>
        }
      />

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p className="placeholder-text">
          Maintain department name, head employee, effective date, and status for the current company.
        </p>

        {error && <div className="alert alert-warning">{error}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="form-field">
            <span>Department Name</span>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Head Employee</span>
            <select name="headEmployeeId" value={formData.headEmployeeId} onChange={handleChange}>
              <option value="">Select employee</option>
              {employeeOptions.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employeeCode} - {employee.employeeName}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Effective Date</span>
            <input type="date" name="effectiveDate" value={formData.effectiveDate} onChange={handleChange} required />
          </label>

          <label className="form-field">
            <span>Status</span>
            <select name="status" value={formData.status} onChange={handleChange} required>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-btn" disabled={saving}>
              {saving ? 'Saving…' : isEditing ? 'Update Department' : 'Create Department'}
            </button>
            {isEditing && (
              <button type="button" className="primary-btn" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <h3>Department Records</h3>
          <p className="placeholder-text">List of department masters scoped to the current company.</p>
        </div>

        {loading ? (
          <p className="placeholder-text">Loading departments…</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Head Employee</th>
                  <th>Effective Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      No departments found.
                    </td>
                  </tr>
                ) : (
                  departments.map((department) => (
                    <tr key={department.id}>
                      <td>{department.name}</td>
                      <td>
                        {department.headEmployeeId?.employeeName
                          ? `${department.headEmployeeId.employeeName}${department.headEmployeeId.employeeCode ? ` (${department.headEmployeeId.employeeCode})` : ''}`
                          : department.headEmployeeId?.employeeCode || '-'}
                      </td>
                      <td>{formatDate(department.effectiveDate)}</td>
                      <td>
                        <span className={`status-pill status-${department.status?.toLowerCase()}`}>
                          {department.status}
                        </span>
                      </td>
                      <td className="row-actions">
                        <button type="button" className="text-action" onClick={() => handleEditDepartment(department)}>
                          Edit
                        </button>
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