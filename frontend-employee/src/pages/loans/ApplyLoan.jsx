import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import { previewLoanEligibility, submitLoanApplication, fetchActiveLoanTypes } from '../../api/loansApi.js';
import { uploadPdfFile } from '../../api/upload.js';
import { getApiErrorMessage } from '../../api/response.js';

function formatCurrency(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function ApplyLoan() {
  const navigate = useNavigate();
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [requestedTenure, setRequestedTenure] = useState('');
  const [purpose, setPurpose] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
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

    async function loadLoanTypes() {
      setLoading(true);
      setError('');

      try {
        const types = await fetchActiveLoanTypes();
        if (!cancelled) {
          const activeOnly = Array.isArray(types) ? types.filter((type) => type.isActive !== false) : [];
          setLoanTypes(activeOnly);
          setSelectedId(activeOnly[0]?._id ?? '');
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err, 'Failed to load loan types.'));
          setLoanTypes([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLoanTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType = useMemo(
    () => loanTypes.find((type) => type._id === selectedId) ?? null,
    [loanTypes, selectedId]
  );

  useEffect(() => {
    const amount = Number(requestedAmount);
    const tenure = Number(requestedTenure);

    if (!selectedId || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(tenure) || tenure <= 0) {
      setPreview(null);
      setPreviewError('');
      return undefined;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setPreviewLoading(true);
      setPreviewError('');

      try {
        const result = await previewLoanEligibility({
          loanTypeId: selectedId,
          requestedAmount: amount,
          requestedTenure: tenure,
        });

        if (!cancelled) {
          setPreview(result);
        }
      } catch (err) {
        if (!cancelled) {
          setPreview(null);
          setPreviewError(getApiErrorMessage(err, 'Failed to preview eligibility.'));
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
  }, [selectedId, requestedAmount, requestedTenure]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!preview?.eligible) {
      setSubmitError('Resolve eligibility issues before submitting.');
      return;
    }

    setSubmitting(true);

    try {
      let attachments = [];

      if (attachmentFile) {
        const uploaded = await uploadPdfFile(attachmentFile);
        attachments = [
          {
            attachmentPath: uploaded.attachmentPath,
            originalName: uploaded.originalName || attachmentFile.name,
            url: uploaded.url,
          },
        ];
      }

      const application = await submitLoanApplication({
        loanTypeId: selectedId,
        requestedAmount: Number(requestedAmount),
        requestedTenureMonths: Number(requestedTenure),
        purpose: purpose.trim(),
        attachments,
      });

      setSubmitSuccess(
        `Application ${application.applicationNo} submitted successfully. Track status under My Loans.`
      );

      window.setTimeout(() => {
        navigate('/loans/applied');
      }, 1500);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to submit loan application.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Apply Loan"
        subtitle="Select a loan type, preview eligibility, and submit your application"
      />

      <div className="card">
        {loading && <p className="placeholder-text">Loading available loan types…</p>}
        {error && <div className="form-error">{error}</div>}

        {!loading && !error && loanTypes.length === 0 && (
          <p className="placeholder-text">
            No active loan types are available right now. Contact your HR administrator.
          </p>
        )}

        {!loading && loanTypes.length > 0 && (
          <form className="apply-loan-form" onSubmit={handleSubmit}>
            <label>
              Loan Type
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                required
              >
                {loanTypes.map((type) => (
                  <option key={type._id} value={type._id}>
                    {type.name} ({type.code})
                  </option>
                ))}
              </select>
            </label>

            {selectedType && (
              <div className="loan-type-summary">
                <p>
                  <strong>Maximum amount:</strong> {formatCurrency(selectedType.maxAmount)}
                </p>
                <p>
                  <strong>Maximum tenure:</strong> {selectedType.maxTenureMonths} months
                </p>
                <p>
                  <strong>Interest rate:</strong> {selectedType.interestRate}%
                </p>
              </div>
            )}

            <div className="form-grid">
              <label>
                Requested Amount (₹)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={requestedAmount}
                  onChange={(e) => setRequestedAmount(e.target.value)}
                  placeholder="e.g. 300000"
                  required
                />
              </label>
              <label>
                Tenure (months)
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={requestedTenure}
                  onChange={(e) => setRequestedTenure(e.target.value)}
                  placeholder="e.g. 60"
                  required
                />
              </label>
            </div>

            <label>
              Purpose (optional)
              <textarea
                rows={3}
                maxLength={500}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Brief reason for the loan request"
              />
            </label>

            <label>
              Supporting document (PDF, max 5MB, optional)
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {previewLoading && (
              <p className="placeholder-text">Checking eligibility…</p>
            )}

            {previewError && <div className="form-error">{previewError}</div>}

            {preview && !previewLoading && (
              <div
                className={
                  preview.eligible ? 'eligibility-preview eligibility-preview--ok' : 'eligibility-preview eligibility-preview--fail'
                }
              >
                <h3>{preview.eligible ? 'Eligible' : 'Not eligible'}</h3>

                {preview.reasons?.length > 0 && (
                  <ul className="eligibility-reasons">
                    {preview.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                )}

                {preview.derived && (
                  <div className="eligibility-derived">
                    <p>
                      <strong>Proposed EMI:</strong> {formatCurrency(preview.derived.proposedEmi)}
                    </p>
                    <p>
                      <strong>Total EMI after application:</strong>{' '}
                      {formatCurrency(preview.derived.totalEmiAfterApplication)}
                    </p>
                    <p>
                      <strong>Max allowed EMI:</strong>{' '}
                      {formatCurrency(preview.derived.maxAllowedEmi)}
                    </p>
                    <p>
                      <strong>Max eligible amount:</strong>{' '}
                      {formatCurrency(preview.derived.maxEligibleAmount)}
                    </p>
                    <p>
                      <strong>Retain after EMI:</strong>{' '}
                      {formatCurrency(preview.derived.retainAfterEmi)} (
                      {preview.derived.retainPercentOfGross ?? '—'}% of gross)
                    </p>
                    {preview.derived.existingActiveLoanEmiTotal > 0 && (
                      <p>
                        <strong>Existing active loan EMIs:</strong>{' '}
                        {formatCurrency(preview.derived.existingActiveLoanEmiTotal)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {submitError && <div className="form-error">{submitError}</div>}
            {submitSuccess && <div className="form-success">{submitSuccess}</div>}

            <button
              type="submit"
              className="primary-btn"
              disabled={!preview?.eligible || submitting}
            >
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
