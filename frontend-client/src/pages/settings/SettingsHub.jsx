import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

const SETTINGS_MODULES = [
  {
    to: '/settings/organization',
    title: 'Organization Setup',
    description: 'Configure departments, designations, grades, regions, and districts.',
  },
  {
    to: '/settings/employees',
    title: 'Employee Management',
    description: 'Create and maintain employee master records and ESS accounts.',
  },
  {
    to: '/settings/loan',
    title: 'Loan Setup',
    description: 'Configure loan types, eligibility rules, and approval workflow.',
  },
  {
    to: '/settings/leave',
    title: 'Leave Setup',
    description: 'Configure leave types, holidays, and accrual rules.',
  },
];

export default function SettingsHub() {
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Organization, employee, loan, and leave configuration"
      />
      <div className="card-grid">
        {SETTINGS_MODULES.map((module) => (
          <Link key={module.to} className="card nav-card" to={module.to}>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
