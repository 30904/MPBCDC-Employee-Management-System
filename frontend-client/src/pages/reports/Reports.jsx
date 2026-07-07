import PlaceholderPage from '../../components/PlaceholderPage.jsx';

export default function Reports() {
  return (
    <PlaceholderPage
      title="Reports"
      subtitle="Reports will be displayed based on the logged-in user's role"
      endpoints={['CLIENT_ADMIN']}
    />
  );
}
