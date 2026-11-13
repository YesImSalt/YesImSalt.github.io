import { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Message from './components/Message';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import AddForm from './screens/AddForm';
import AppointmentList from './screens/AppointmentList';

// Browser tab titles.
const TITLES = {
  login: 'Sign in',
  dashboard: 'Dashboard',
  add: 'New appointment',
  list: 'All appointments'
};

export default function App() {
  // Restore the saved username, or start signed out.
  const [user, setUser] = useState(() => localStorage.getItem('clinic-user') || '');

  // Choose the first screen.
  const [screen, setScreen] = useState(user ? 'dashboard' : 'login');

  // Shared data and page status.
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Show a message at the top of the page.
  function say(text, isError = false) {
    setMessage({ text, isError });
  }

  // Change screens and clear the message.
  function go(name) {
    say('');
    setScreen(name);
  }

  // Load appointments from the server.
  async function loadAppointments() {
    setLoading(true);

    try {
      const response = await fetch('/api/appointments');
      if (!response.ok) throw new Error('Could not load appointments.');
      const records = await response.json();
      setAppointments(records);
      return records;
    } catch {
      // Show an error if the server cannot be reached.
      say('Cannot reach the server. Make sure it is running, then try again.', true);
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Load appointments after sign-in.
  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user]);

  // Update the tab title and focus the new heading.
  useEffect(() => {
    document.title = TITLES[screen] + ' - Clinic Appointments';
    document.querySelector('main h1').focus();
  }, [screen]);

  // Save the username and open the dashboard.
  function signIn(name) {
    localStorage.setItem('clinic-user', name);
    setUser(name);
    go('dashboard');
  }

  // Sign out and clear the saved data.
  function signOut() {
    localStorage.removeItem('clinic-user');
    setUser('');
    setAppointments([]);
    go('login');
    say('You have signed out.');
  }

  // Save a status change and update the list.
  async function changeStatus(appointment, status) {
    say('Updating status…');

    try {
      const response = await fetch('/api/appointments/' + appointment.id + '/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const updatedAppointment = await response.json();

      if (!response.ok) {
        say(updatedAppointment.message, true);
        return;
      }

      // Replace the old appointment with the updated one.
      setAppointments(currentAppointments =>
        currentAppointments.map(item =>
          item.id === appointment.id ? updatedAppointment : item
        )
      );
      say('Status for ' + appointment.patient + ' changed to ' + status + '.');
    } catch {
      say('Cannot reach the server. Make sure it is running, then try again.', true);
    }
  }

  // Refresh the list after saving an appointment.
  async function saved(patient) {
    await loadAppointments();
    go('list');
    say('Appointment for ' + patient + ' was saved.');
  }

  return (
    <>
      {/* Let keyboard users skip the header. */}
      <a className="skip" href="#main">Skip to main content</a>

      {/* Show navigation and sign-out. */}
      <Header
        signedIn={user !== ''}
        screen={screen}
        go={go}
        onSignOut={signOut}
      />

      <main id="main" tabIndex="-1">
        {/* Show messages and errors. */}
        <Message text={message.text} isError={message.isError} />

        {/* Show the selected screen. */}
        {screen === 'login' && <LoginScreen onSignIn={signIn} say={say} />}
        {screen === 'dashboard' && (
          <Dashboard
            user={user}
            appointments={appointments}
            loading={loading}
            go={go}
          />
        )}
        {screen === 'add' && <AddForm onSaved={saved} say={say} />}
        {screen === 'list' && (
          <AppointmentList
            appointments={appointments}
            loading={loading}
            go={go}
            onStatusChange={changeStatus}
          />
        )}
      </main>
    </>
  );
}
