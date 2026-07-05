const MODULE_LABELS = {
  loanManagement: 'Loan Management',
  leaveManagement: 'Leave Management',
  serviceRecords: 'Employee Service Records',
};

export default function CompanyModuleFlags({ moduleFlags = {}, editable = false, onChange }) {
  const entries = Object.entries(MODULE_LABELS);

  if (editable) {
    return (
      <fieldset className="module-fieldset">
        <legend>Module Flags</legend>
        {entries.map(([key, label]) => (
          <label key={key} className="checkbox-label">
            <input
              type="checkbox"
              checked={moduleFlags[key] !== false}
              onChange={() => onChange(key, !(moduleFlags[key] !== false))}
            />
            {label}
          </label>
        ))}
      </fieldset>
    );
  }

  return (
    <ul className="module-flags">
      {entries.map(([key, label]) => (
        <li key={key}>
          {label}: {moduleFlags[key] !== false ? 'Enabled' : 'Disabled'}
        </li>
      ))}
    </ul>
  );
}
