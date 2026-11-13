import Button from '../components/Button';

// Show appointment totals and main actions.
export default function Dashboard({ user, appointments, loading, go }) {
  // Today's date in the format used by the data.
  const today = new Date().toLocaleDateString('en-CA');
  // Keep scheduled appointments.
  const scheduled = appointments.filter(a => a.status === 'Scheduled');

  return (
    <section className="dashboard-card">
      <h1 tabIndex="-1">Dashboard</h1>
      <p>Signed in as {user}.</p>

      <h2>Clinic activity</h2>
      {/* Show loading text while data arrives. */}
      {loading ? (
        <p>Loading summary…</p>
      ) : (
        <ul className="stats">
          <li><strong>{appointments.length}</strong>appointments in total</li>
          <li><strong>{scheduled.filter(a => a.date === today).length}</strong>scheduled for today</li>
          <li><strong>{scheduled.filter(a => a.priority === 'Urgent').length}</strong>urgent and still scheduled</li>
        </ul>
      )}

      <h2>What would you like to do?</h2>
      <div className="actions">
        <Button onClick={() => go('add')}>New appointment</Button>
        <Button variant="alt" onClick={() => go('list')}>Find appointments</Button>
      </div>
    </section>
  );
}
