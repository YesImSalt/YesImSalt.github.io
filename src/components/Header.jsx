import Button from './Button';

// Screen names and their button labels.
const LINKS = [['dashboard', 'Dashboard'], ['add', 'New appointment'], ['list', 'All appointments']];

// Show the app name and signed-in navigation.
export default function Header({ signedIn, screen, go, onSignOut }) {
  return (
    <header>
      {/* The signed-in logo returns to the dashboard. */}
      {signedIn ? (
        <button
          type="button"
          className="logo logo-button"
          onClick={() => go('dashboard')}
          aria-label="Clinic Appointments, goes to dashboard" // Screen-reader label.
        >
          Clinic Appointments
        </button>
      ) : (
        <p className="logo">Clinic Appointments</p>
      )}
      {signedIn && (
        // Navigation for signed-in users.
        <nav aria-label="Main">
          <ul>
            {/* Add one button for each screen. */}
            {LINKS.map(([name, label]) => (
              <li key={name}>
                <Button variant="link" current={screen === name} onClick={() => go(name)}>{label}</Button>
              </li>
            ))}
            <li><Button variant="link" onClick={onSignOut}>Sign out</Button></li>
          </ul>
        </nav>
      )}
    </header>
  );
}
