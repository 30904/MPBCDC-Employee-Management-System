import { useLocation } from 'react-router-dom';

export default function ModuleAccessDeniedAlert() {
  const location = useLocation();
  const denied = location.state?.error === 'module-access-denied';

  if (!denied) {
    return null;
  }

  return (
    <div className="alert alert-warning" role="alert">
      You do not have permission to access that module.
    </div>
  );
}
