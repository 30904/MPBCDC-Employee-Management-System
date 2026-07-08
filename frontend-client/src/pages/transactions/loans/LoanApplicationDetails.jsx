import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchLoanApplication } from '../../../api/loanApplicationsApi.js';
import { getApiErrorMessage } from '../../../utils/apiError.js';
import { resolveUploadUrl } from '../../../utils/uploadUrl.js';

function formatCurrency(amount) {
  if (amount === undefined || amount === null) {
    return '—';
  }

  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function employeeLabel(employee) {
  if (!employee || typeof employee !== 'object') {
    return '—';
  }

  const code = employee.employeeCode || employee._id?.slice(-6);
  const name = employee.employeeName;

  if (name && code) {
    return `${name} (${code})`;
  }

  return name || code || '—';
}

function loanTypeLabel(loanType) {
  if (!loanType || typeof loanType !== 'object') {
    return '—';
  }

  return `${loanType.name} (${loanType.code})`;
}

function eligibilitySummary(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return '—';
  }

  const eligible = snapshot.eligible === true ? 'Eligible' : 'Not eligible';
  const reasons = Array.isArray(snapshot.reasons) ? snapshot.reasons.filter(Boolean) : [];

  if (reasons.length === 0) {
    return eligible;
  }

  return `${eligible} — ${reasons.join('; ')}`;
}

function formatInterestFormula(value) {
  if (value === 'SIMPLE_INTEREST') {
    return 'Simple Interest';
  }

  if (value === 'COMPOUND_INTEREST') {
    return 'Compound Interest';
  }

  return value || '—';
}

export default function LoanApplicationDetails() {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadApplication() {
      setLoading(true);
      setError('');

      try {
        const data = await fetchLoanApplication(id);
        if (isMounted) {
          setApplication(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Unable to load loan application.'));
          setApplication(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadApplication();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const attachments = useMemo(() => {
    if (!Array.isArray(application?.attachments)) {
      return [];
    }

    return application.attachments
      .filter((attachment) => attachment?.url || attachment?.attachmentPath)
      .map((attachment) => ({
        ...attachment,
        resolvedUrl: resolveUploadUrl(attachment.url || `/uploads/${attachment.attachmentPath}`),
        displayName: attachment.originalName || attachment.filename || 'Supporting document.pdf',
      }));
  }, [application]);

  if (loading) {
    return (
      <div>
        <div className="section-header">
          <div>
            <h3>Loan Application</h3>
            <p className="placeholder-text">Loading application details…</p>
          </div>
        </div>
        <div className="card">Loading application…</div>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <div>
          <h3>Loan Application</h3>
          <p className="placeholder-text">
            Full application submitted from the employee portal, including supporting documents.
          </p>
        </div>
      </div>

      <div className="card">
        {error && <div className="form-error">{error}</div>}

        {application && (
          <>
            <h4>Application Summary</h4>
            <div className="detail-grid">
              <div>
                <strong>Application No.</strong>
                <span>
                  <code>{application.applicationNo || application._id?.slice(-6)}</code>
                </span>
              </div>
              <div>
                <strong>Status</strong>
                <span>{application.status}</span>
              </div>
              <div>
                <strong>Submitted</strong>
                <span>{formatDate(application.submittedAt || application.createdAt)}</span>
              </div>
              <div>
                <strong>Employee</strong>
                <span>{employeeLabel(application.employeeId)}</span>
              </div>
            </div>

            <h4>Loan Request</h4>
            <div className="detail-grid">
              <div>
                <strong>Loan Type</strong>
                <span>{loanTypeLabel(application.loanTypeId)}</span>
              </div>
              <div>
                <strong>Requested Amount</strong>
                <span>{formatCurrency(application.requestedAmount)}</span>
              </div>
              <div>
                <strong>Tenure</strong>
                <span>
                  {application.requestedTenureMonths
                    ? `${application.requestedTenureMonths} months`
                    : '—'}
                </span>
              </div>
              <div>
                <strong>EMI Start Date</strong>
                <span>{formatDate(application.emiStartDate)}</span>
              </div>
              <div>
                <strong>EMI End Date</strong>
                <span>{formatDate(application.emiEndDate)}</span>
              </div>
              <div>
                <strong>Interest Rate</strong>
                <span>
                  {application.interestRate !== undefined && application.interestRate !== null
                    ? `${application.interestRate}%`
                    : '—'}
                </span>
              </div>
              <div>
                <strong>Monthly EMI</strong>
                <span>{formatCurrency(application.monthlyEmi)}</span>
              </div>
              <div>
                <strong>Purpose</strong>
                <span>{application.purpose?.trim() || '—'}</span>
              </div>
              <div>
                <strong>Eligibility</strong>
                <span>{eligibilitySummary(application.eligibilitySnapshot)}</span>
              </div>
              <div>
                <strong>Interest Formula</strong>
                <span>
                  {formatInterestFormula(application.eligibilitySnapshot?.derived?.interestFormula)}
                </span>
              </div>
            </div>

            <h4>Supporting Documents</h4>
            {attachments.length === 0 ? (
              <p className="placeholder-text">No supporting documents were submitted with this application.</p>
            ) : (
              <div className="attachment-list">
                {attachments.map((attachment, index) => (
                  <div key={`${attachment.resolvedUrl}-${index}`} className="attachment-item">
                    <span className="attachment-name">{attachment.displayName}</span>
                    <div className="attachment-actions">
                      <a
                        href={attachment.resolvedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-btn btn-sm attachment-download"
                      >
                        Preview
                      </a>
                      <a
                        href={attachment.resolvedUrl}
                        download={attachment.displayName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="secondary-btn btn-sm attachment-download"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <p className="back-link">
          <Link to="/transactions/loans/applications">← Back to loan applications</Link>
        </p>
      </div>
    </div>
  );
}
