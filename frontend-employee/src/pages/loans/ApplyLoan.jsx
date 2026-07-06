import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchActiveLoanTypes, previewLoanEligibility } from '../../api/loansApi.js';
import { getApiErrorMessage } from '../../api/response.js';

function formatCurrency(amount) {
  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function ApplyLoan() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [requestedTenure, setRequestedTenure] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');

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

  return (
    <div>
      <PageHeader
        title="Apply Loan"
        subtitle="Select a loan type and preview eligibility before submitting"
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
          <form className="apply-loan-form">
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

            <button
              type="button"
              className="primary-btn"
              disabled={!preview?.eligible}
              title={preview?.eligible ? 'Submit will be enabled in the next phase' : 'Resolve eligibility issues first'}
            >
              Submit Application (coming soon)
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
