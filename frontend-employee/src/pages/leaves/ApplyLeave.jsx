import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import {
  createLeaveDraft,
  fetchLeaveTypeOptions,
  previewLeaveDays,
  submitLeaveApplication,
} from '../../api/leaveApi.js';
import { uploadPdfFile } from '../../api/upload.js';
import { getApiErrorMessage } from '../../api/response.js';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPath, setAttachmentPath] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const selectedType = useMemo(
    () => leaveTypes.find((type) => type._id === leaveTypeId) ?? null,
    [leaveTypes, leaveTypeId]
  );

  const halfDayAllowed = selectedType?.allowsHalfDay !== false;
  const canSubmit = Boolean(preview?.sufficientBalance);

  useEffect(() => {
    let cancelled = false;

    async function loadLeaveTypes() {
      setLoading(true);
      setError('');

      try {
        const options = await fetchLeaveTypeOptions();
        if (!cancelled) {
          const activeOnly = Array.isArray(options) ? options.filter((type) => type.isActive !== false) : [];
          setLeaveTypes(activeOnly.length > 0 ? activeOnly : Array.isArray(options) ? options : []);
          setLeaveTypeId((activeOnly[0] || options?.[0])?._id || '');
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
    if (!halfDayAllowed && isHalfDay) {
      setIsHalfDay(false);
    }
  }, [halfDayAllowed, isHalfDay]);

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
        const result = await previewLeaveDays({ leaveTypeId, fromDate, toDate, isHalfDay });
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
    }, 400);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [leaveTypeId, fromDate, toDate, isHalfDay]);

  async function buildPayload() {
    let resolvedAttachmentPath = attachmentPath;

    if (attachmentFile) {
      const uploaded = await uploadPdfFile(attachmentFile);
      resolvedAttachmentPath = uploaded.attachmentPath || '';
      setAttachmentPath(resolvedAttachmentPath);
    }

    return {
      leaveTypeId,
      fromDate,
      toDate,
      isHalfDay: halfDayAllowed ? isHalfDay : false,
      reason: reason.trim(),
      attachmentPath: resolvedAttachmentPath,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!canSubmit) {
      setSubmitError('Resolve balance issues before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = await buildPayload();
      const application = await submitLeaveApplication(payload);
      setSubmitSuccess(
        `Application ${application.applicationNo} submitted successfully. Track status under Leave History.`
      );

      window.setTimeout(() => {
        navigate('/leaves/history');
      }, 1500);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to submit leave application.'));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSaveDraft() {
    setSubmitError('');
    setSubmitSuccess('');
    setSavingDraft(true);

    try {
      const payload = await buildPayload();
      const draft = await createLeaveDraft(payload);
      setSubmitSuccess(`Draft ${draft.applicationNo} saved. Submit it from Leave History when ready.`);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save leave draft.'));
    } finally {
      setSavingDraft(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Apply Leave"
        subtitle="Select a leave type, preview days and balance, and submit your application"
      />

      <div className="card">
        {loading && <p className="placeholder-text">Loading available leave types…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && leaveTypes.length === 0 && (
          <p className="placeholder-text">
            No active leave types are available right now. Contact your HR administrator.
          </p>
        )}

        {!loading && leaveTypes.length > 0 && (
          <form className="apply-loan-form" onSubmit={handleSubmit}>
            <label>
              Leave Type
              <select value={leaveTypeId} onChange={(event) => setLeaveTypeId(event.target.value)} required>
                {leaveTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
            </label>

            {selectedType && (
              <div className="loan-type-summary">
                <p>
                  <strong>Annual entitlement:</strong> {selectedType.annualEntitlement ?? '—'} days
                </p>
                <p>
                  <strong>Sandwich rule:</strong> {selectedType.applySandwichRule ? 'Applicable' : 'Not applicable'}
                </p>
                <p>
                  <strong>Half-day allowed:</strong> {halfDayAllowed ? 'Yes' : 'No'}
                </p>
              </div>
            )}

            <div className="form-grid">
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
              {halfDayAllowed && (
                <label className="checkbox-field">
                  <span>Half Day</span>
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(event) => setIsHalfDay(event.target.checked)}
                  />
                </label>
              )}
            </div>

            <label>
              Reason (optional)
              <textarea
                rows={3}
                maxLength={1000}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Brief reason for the leave request"
              />
            </label>

            <label>
              Supporting document (PDF, max 5MB, optional)
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)}
              />
            </label>

            {previewLoading && <p className="placeholder-text">Calculating leave days…</p>}
            {previewError && <div className="form-error">{previewError}</div>}

            {preview && !previewLoading && (
              <div
                className={
                  preview.sufficientBalance
                    ? 'eligibility-preview eligibility-preview--ok'
                    : 'eligibility-preview eligibility-preview--fail'
                }
              >
                <h3>{preview.sufficientBalance ? 'Ready to submit' : 'Insufficient balance'}</h3>

                {!preview.sufficientBalance && (
                  <ul className="eligibility-reasons">
                    <li>
                      Available balance is {preview.balanceBefore} day(s); this request needs{' '}
                      {preview.chargeableDays} day(s).
                    </li>
                  </ul>
                )}

                <div className="eligibility-derived">
                  <p>
                    <strong>Working days:</strong> {preview.workingDays}
                  </p>
                  <p>
                    <strong>Holidays sandwiched:</strong> {preview.holidayDays ?? 0}
                  </p>
                  <p>
                    <strong>Weekend sandwiched:</strong> {preview.weekendDays ?? 0}
                  </p>
                  <p>
                    <strong>Sandwich total:</strong> {preview.sandwichDaysApplied}
                    {preview.applySandwichRule ? ' (rule ON)' : ' (rule OFF)'}
                  </p>
                  <p>
                    <strong>Total deducted:</strong> {preview.chargeableDays}
                  </p>
                  <p>
                    <strong>Calendar days:</strong> {preview.totalCalendarDays}
                  </p>
                  <p>
                    <strong>Balance before:</strong> {preview.balanceBefore}
                  </p>
                  <p>
                    <strong>Balance after:</strong> {preview.balanceAfter}
                  </p>
                </div>
              </div>
            )}

            {submitError && <div className="form-error">{submitError}</div>}
            {submitSuccess && <div className="form-success">{submitSuccess}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                disabled={!leaveTypeId || !fromDate || !toDate || savingDraft || submitting}
                onClick={handleSaveDraft}
              >
                {savingDraft ? 'Saving draft…' : 'Save Draft'}
              </button>
              <button type="submit" className="primary-btn" disabled={!canSubmit || submitting}>
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
