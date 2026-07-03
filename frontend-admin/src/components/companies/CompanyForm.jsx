import { useState } from 'react';

const DEFAULT_MODULE_FLAGS = {
  loanManagement: true,
  leaveManagement: true,
  serviceRecords: true,
};

export default function CompanyForm({ onSubmit, onCancel, submitLabel = 'Create Company' }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [moduleFlags, setModuleFlags] = useState(DEFAULT_MODULE_FLAGS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggleModule(key) {
    setModuleFlags((current) => ({ ...current, [key]: !current[key] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit({
        name,
        code,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        moduleFlags,
      });
      setName('');
      setCode('');
      setContactEmail('');
      setContactPhone('');
      setModuleFlags(DEFAULT_MODULE_FLAGS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card" onSubmit={handleSubmit}>
      <h3>New Company</h3>
      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <label>
          Company Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Company Code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
            maxLength={20}
            placeholder="e.g. MPBCDC01"
          />
        </label>
        <label>
          Contact Email
          <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </label>
        <label>
          Contact Phone
          <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
        </label>
      </div>

      <fieldset className="module-fieldset">
        <legend>Enabled Modules</legend>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={moduleFlags.loanManagement}
            onChange={() => toggleModule('loanManagement')}
          />
          Loan Management
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={moduleFlags.leaveManagement}
            onChange={() => toggleModule('leaveManagement')}
          />
          Leave Management
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={moduleFlags.serviceRecords}
            onChange={() => toggleModule('serviceRecords')}
          />
          Employee Service Records
        </label>
      </fieldset>

      <div className="form-actions">
        {onCancel && (
          <button type="button" className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
