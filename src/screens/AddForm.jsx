import { useState } from 'react';
import TextField from '../components/TextField';
import SelectField from '../components/SelectField';
import RadioGroup from '../components/RadioGroup';
import Checkbox from '../components/Checkbox';
import Button from '../components/Button';
import LANGUAGES from '../languages';

// Latest allowed booking date.
const LATEST_DATE = '2038-01-19';

// Starting values for a new form.
const EMPTY = {
  patient: '', date: '', time: '', kind: '', kindOther: '', status: 'Scheduled',
  priority: 'Routine', interpreter: false, language: '', wheelchair: false, notes: ''
};

// Form for adding an appointment.
export default function AddForm({ onSaved, say }) {
  const [form, setForm] = useState(EMPTY); // Current form values.
  const [errors, setErrors] = useState({}); // Server validation errors.
  const [saving, setSaving] = useState(false);

  // Use today's date as the earliest booking date.
  const today = new Date().toLocaleDateString('en-CA');

  // Update one field without changing the others.
  const set = name => value => setForm({ ...form, [name]: value });

  // Send the form when submitted.
  async function handleSubmit(e) {
    e.preventDefault();
    if (saving) return; // Ignore repeat clicks.
    setSaving(true);
    setErrors({}); // Clear old errors.
    say('Saving appointment…');

    try {
      // Send the form data to the server.
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();

      if (res.status === 422) {
        // Show field errors and focus the first one.
        setErrors(data.errors);
        const keys = Object.keys(data.errors);
        document.getElementById(keys[0])?.focus(); // Focus it if it exists.
        say('Appointment not saved. Fix the ' + keys.length + ' error(s) below.', true);
      } else if (!res.ok) {
        if (data.message === 'The request could not be read.' && await onSaved(form, true)) {
          return;
        }
        say(data.message, true);
      } else {
        // Refresh the list and show a confirmation.
        await onSaved(form);
        return;
      }
    } catch {
      // The server could not be reached.
      say('Cannot reach the server. Make sure it is running, then try again.', true);
    }
    setSaving(false); // Allow another try.
  }

  return (
    <section>
      <h1 tabIndex="-1">New appointment</h1>
      <form onSubmit={handleSubmit} noValidate>

        {/* Patient, date, and time. */}
        <TextField id="patient" label="Patient full name" value={form.patient} onChange={set('patient')} error={errors.patient} />
        {/* Limit the booking date. */}
        <TextField id="date" label="Date" type="date" min={today} max={LATEST_DATE}
          value={form.date} onChange={set('date')} error={errors.date} />
        <TextField id="time" label="Time" type="time" value={form.time} onChange={set('time')} error={errors.time} />

        <SelectField id="kind" label="Visit type" value={form.kind} onChange={set('kind')} error={errors.kind}
          placeholder="Select a visit type" options={['Check-up', 'Follow-up', 'Vaccination', 'Lab review', 'Other']} />

        {/* Ask for details when "Other" is selected. */}
        {form.kind === 'Other' && (
          <TextField id="kindOther" label="Describe the visit type" value={form.kindOther} onChange={set('kindOther')} error={errors.kindOther} />
        )}

        <SelectField id="status" label="Status" value={form.status} onChange={set('status')} options={['Scheduled', 'Completed', 'Cancelled']} />

        {/* Choose one priority. */}
        <RadioGroup legend="Priority" name="priority" options={['Routine', 'Urgent']} value={form.priority} onChange={set('priority')} />

        {/* Select any patient needs. */}
        <fieldset>
          <legend>Patient needs (optional)</legend>
          <Checkbox id="interpreter" label="Interpreter needed" checked={form.interpreter} onChange={set('interpreter')} />
          {/* Ask for a language when an interpreter is needed. */}
          {form.interpreter && (
            <SelectField id="language" label="Language" value={form.language} onChange={set('language')} error={errors.language}
              placeholder="Select a language" options={LANGUAGES} />
          )}
          <Checkbox id="wheelchair" label="Wheelchair access" checked={form.wheelchair} onChange={set('wheelchair')} />
        </fieldset>

        <TextField id="notes" label="Patient notes (optional)" textarea value={form.notes} onChange={set('notes')} />

        <div className="actions">
          {/* Show the save status on the button. */}
          <Button type="submit" busy={saving}>{saving ? 'Saving…' : 'Save appointment'}</Button>
        </div>
      </form>
    </section>
  );
}
