import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { fetchActiveLoanTypes } from '../../api/loansApi.js';
import { getApiErrorMessage } from '../../api/response.js';

function formatCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export default function ApplyLoan() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div>
      <PageHeader
        title="Apply Loan"
        subtitle="Choose an active loan type configured by your organization"
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
                {selectedType.minServiceYears > 0 && (
                  <p>
                    <strong>Minimum service:</strong> {selectedType.minServiceYears} years
                  </p>
                )}
              </div>
            )}

            <p className="placeholder-text">
              Loan application submission will be enabled in the next phase.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
