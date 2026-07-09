import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

const ORGANIZATION_MODULES = [
  {
    to: '/settings/organization/departments',
    title: 'Departments',
    description: 'Define department structure for the company.',
  },
  {
    to: '/settings/organization/designations',
    title: 'Designations',
    description: 'Maintain job titles and reporting labels.',
  },
  {
    to: '/settings/organization/grades',
    title: 'Grades',
    description: 'Configure grade bands and internal levels.',
  },
  {
    to: '/settings/organization/regions',
    title: 'Regions',
    description: 'Set up regional groups for organizational hierarchy.',
  },
  {
    to: '/settings/organization/districts',
    title: 'Districts',
    description: 'Define district masters linked to regional structure.',
  },
];

export default function OrganizationSetup() {
  return (
    <div>
      <PageHeader
        title="Organization Setup"
        subtitle="Master data setup for the HRMS"
      />
      <div className="card-grid">
        {ORGANIZATION_MODULES.map((module) => (
          <Link key={module.to} className="card nav-card" to={module.to}>
            <h3>{module.title}</h3>
            <p>{module.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
