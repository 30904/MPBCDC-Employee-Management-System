import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

export default function ServiceRecords() {
  return (
    <div>
      <PageHeader
        title="Employee Service Records"
        subtitle="Service record and service book access"
      />
      <div className="card-grid">
        <Link className="card nav-card" to="/service-records/book">
          <h3>Employee Service Book</h3>
          <p>Open the service book placeholder screen.</p>
        </Link>
      </div>
    </div>
  );
}
