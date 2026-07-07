import { useEffect, useState } from 'react';
import apiClient from '../api/apiClient.js';
import PageHeader from '../components/PageHeader.jsx';
import { getUser } from '../utils/auth.js';

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toISOString().slice(0, 10);
}

export default function Profile() {
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const { data } = await apiClient.get('/employees/me');
        if (isMounted) {
          setProfile(data.data ?? data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.error || 'Unable to load profile details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = profile?.employeeName || user?.employeeName || '-';
  const displayDepartment = profile?.department || '-';
  const displayDesignation = profile?.designation || '-';
  const displayGrade = profile?.grade || '-';
  const displayReportingManager = profile?.reportingManager?.employeeName
    ? `${profile.reportingManager.employeeName}${profile.reportingManager.employeeCode ? ` (${profile.reportingManager.employeeCode})` : ''}`
    : profile?.reportingManager?.employeeCode || '-';
  const displayJoiningDate = formatDate(profile?.joiningDate);

  return (
    <div>
      <PageHeader
        title="My Profile"
        subtitle="Read-only employee profile"
      />
      <div className="card">
        <p className="placeholder-text">
          This view is read-only and shows only your employee profile summary.
        </p>

        {loading && <p className="placeholder-text">Loading profile…</p>}
        {error && <div className="alert alert-warning">{error}</div>}

        {!loading && !error && (
          <div className="detail-grid">
            <div>
              <strong>Employee Name</strong>
              <span>{displayName}</span>
            </div>
            <div>
              <strong>Department</strong>
              <span>{displayDepartment}</span>
            </div>
            <div>
              <strong>Designation</strong>
              <span>{displayDesignation}</span>
            </div>
            <div>
              <strong>Grade</strong>
              <span>{displayGrade}</span>
            </div>
            <div>
              <strong>Reporting Manager</strong>
              <span>{displayReportingManager}</span>
            </div>
            <div>
              <strong>Joining Date</strong>
              <span>{displayJoiningDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
