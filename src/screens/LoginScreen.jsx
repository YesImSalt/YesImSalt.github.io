import { useState } from 'react';
import TextField from '../components/TextField';
import Button from '../components/Button';

// Demo sign-in screen. Any non-empty username and password work.
export default function LoginScreen({ onSignIn, say }) {
  // Form values and state.
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Check the form before signing in.
  function handleSubmit(e) {
    e.preventDefault(); // Keep the submit in React.
    if (busy) return; // Ignore repeat clicks.

    // Collect any field errors.
    const found = {};
    if (!user.trim()) found.user = 'Enter your username.';
    if (!pass) found.pass = 'Enter your password.';
    setErrors(found);

    const keys = Object.keys(found);
    if (keys.length > 0) {
      document.getElementById(keys[0]).focus(); // Focus the first error.
      say('Please fix ' + keys.length + ' error(s) in the form.', true);
      return;
    }

    // Simulate a short sign-in delay.
    setBusy(true);
    say('Signing in…');
    setTimeout(() => onSignIn(user.trim()), 900);
  }

  return (
    <section>
      {/* App focuses this heading when the screen changes. */}
      <h1 tabIndex="-1">Sign in</h1>
      {/* Use our own validation messages. */}
      <form onSubmit={handleSubmit} noValidate>
        <TextField id="user" label="Username" value={user} onChange={setUser} error={errors.user} autoComplete="username" />
        <TextField id="pass" label="Password" type="password" value={pass} onChange={setPass} error={errors.pass} autoComplete="current-password" />
        <Button type="submit" busy={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
      </form>
    </section>
  );
}
