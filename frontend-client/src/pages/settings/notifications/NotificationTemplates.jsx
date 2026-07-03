import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';

export default function NotificationTemplates() {
  return (
    <div>
      <PageHeader
        title="Notification Templates"
        subtitle="Workflow message templates for the client portal"
      />
      <div className="card">
        <p className="placeholder-text">
          Notification template management will be added here.
        </p>
        <Link to="/settings/notifications/templates">Open templates view</Link>
      </div>
    </div>
  );
}
