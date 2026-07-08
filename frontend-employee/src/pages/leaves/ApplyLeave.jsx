import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchLeaveTypeOptions, previewLeaveDays, submitLeaveApplication } from '../../api/leaveApi.js';
import { getApiErrorMessage } from '../../api/response.js';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadLeaveTypes() {
      setLoading(true);
      setError('');

      try {
        const options = await fetchLeaveTypeOptions();
        if (!cancelled) {
          setLeaveTypes(Array.isArray(options) ? options : []);
          setLeaveTypeId(options?.[0]?._id || '');
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load leave types.'));
          setLeaveTypes([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLeaveTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!leaveTypeId || !fromDate || !toDate) {
      setPreview(null);
      setPreviewError('');
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError('');

      try {
        const result = await previewLeaveDays({ leaveTypeId, fromDate, toDate });
        if (!cancelled) {
          setPreview(result);
        }
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(getApiErrorMessage(err, 'Failed to preview leave days.'));
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [leaveTypeId, fromDate, toDate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    setSubmitting(true);
    try {
      const application = await submitLeaveApplication({
        leaveTypeId,
        fromDate,
        toDate,
        reason: reason.trim(),
      });
      setSubmitSuccess(`Application ${application.applicationNo} submitted successfully.`);

      window.setTimeout(() => {
        navigate('/leaves/history');
      }, 1200);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to submit leave application.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Apply Leave" subtitle="Submit a leave request for approval" />

      <div className="card">
        {loading && <p className="placeholder-text">Loading leave types...</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && leaveTypes.length === 0 && (
          <p className="placeholder-text">No active leave types available. Contact your administrator.</p>
        )}

        {!loading && leaveTypes.length > 0 && (
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Leave Type
                <select value={leaveTypeId} onChange={(event) => setLeaveTypeId(event.target.value)} required>
                  {leaveTypes.map((type) => (
                    <option key={type._id} value={type._id}>
                      {type.name} ({type.code})
                      {type.applySandwichRule ? ' — sandwich' : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                From Date
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  required
                />
              </label>

              <label>
                To Date
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  required
                />
              </label>
            </div>

            <label>
              Reason
              <textarea
                rows={3}
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Brief reason for leave request"
              />
            </label>

            {previewLoading && <p className="placeholder-text">Calculating leave days...</p>}
            {previewError && <div className="form-error">{previewError}</div>}

            {preview && !previewLoading && (
              <div className="eligibility-preview eligibility-preview--ok">
                <h3>Leave days preview</h3>
                <div className="eligibility-derived">
                  <p>
                    <strong>Working days:</strong> {preview.workingDays}
                  </p>
                  <p>
                    <strong>Sandwich days:</strong> {preview.sandwichDaysApplied}
                    {preview.applySandwichRule ? ' (rule on)' : ' (rule off)'}
                  </p>
                  <p>
                    <strong>Chargeable days:</strong> {preview.chargeableDays}
                  </p>
                  <p>
                    <strong>Calendar days:</strong> {preview.totalCalendarDays}
                  </p>
                </div>
              </div>
            )}

            {submitError && <div className="form-error">{submitError}</div>}
            {submitSuccess && <div className="form-success">{submitSuccess}</div>}

            <button
              type="submit"
              className="primary-btn"
              disabled={!leaveTypeId || !fromDate || !toDate || submitting}
            >
              {submitting ? 'Submitting...' : 'Submit Leave Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
