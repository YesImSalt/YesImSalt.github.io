// ============================================================
// server.js - the BACKEND.
// It does two jobs:
//   1. Serves the built React website (the files in the "dist" folder)
//   2. Provides a small API (/api/appointments) to read and save data
// ============================================================

const fs = require('fs');             // built into Node: lets us check if files exist
const path = require('path');         // built into Node: builds file paths that work on every computer
const express = require('express');   // the web server library
const db = require('./db');           // our own file (db.js) that stores the appointments

const app = express();

// The visit types we accept. The server re-checks everything the browser sends,
// because a browser can never be fully trusted.
const KINDS = ['Check-up', 'Follow-up', 'Vaccination', 'Lab review', 'Other'];

// The latest booking date allowed (the React form uses the same limit)
const LATEST_DATE = '2038-01-19';

// The folder Vite creates when you run "npm run build"
const dist = path.join(__dirname, 'dist');

// Middleware: runs on every request before our routes.
app.use(express.json({ limit: '50kb' })); // turns a JSON request body into req.body
app.use(express.static(dist));            // serves the website files (index.html, JS, CSS)

// ---------- Helpers ----------

// Takes whatever the browser sent and returns a tidy record with only the fields we want.
// This trims spaces, forces the right types, and drops anything unexpected.
const clean = b => ({
  patient: String(b.patient ?? '').trim(),
  date: String(b.date ?? ''),
  time: String(b.time ?? ''),
  kind: b.kind,
  // Only keep the "Other" description when the visit type really is "Other"
  kindOther: b.kind === 'Other' ? String(b.kindOther ?? '').trim() : '',
  priority: b.priority,
  // Fall back to "Scheduled" if the status is missing or not one of the three allowed values
  status: ['Scheduled', 'Completed', 'Cancelled'].includes(b.status) ? b.status : 'Scheduled',
  interpreter: !!b.interpreter,     // !! turns any value into true or false
  language: b.interpreter ? String(b.language ?? '').trim() : '',
  wheelchair: !!b.wheelchair,
  notes: String(b.notes ?? '').trim().slice(0, 500) // notes are capped at 500 characters
});

// Checks a cleaned record. Returns an object like { patient: 'Enter the name' }.
// An empty object means "no problems".
function check(r, id) {
  const e = {};
  if (r.patient.length < 2) e.patient = 'Enter the patient’s full name (at least 2 characters).';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date)) e.date = 'Choose the appointment date.';   // must look like 2026-12-31
  // Dates in this format can be compared as plain text. We allow from yesterday's date on, because
  // the server may be in a different time zone from the user and it could already be "tomorrow" here.
  else if (r.date < new Date(Date.now() - 864e5).toLocaleDateString('en-CA')) e.date = 'The date cannot be in the past. Choose today or a later date.';
  else if (r.date > LATEST_DATE) e.date = 'The date cannot be after 19 January 2038.';
  if (!/^\d{2}:\d{2}$/.test(r.time)) e.time = 'Choose the appointment time.';         // must look like 09:30
  // Error prevention: don't allow the same patient twice at the same date and time
  else if (!e.patient && !e.date && db.clash(r, id)) {
    e.time = 'This patient already has an appointment at that date and time. Choose a different time.';
  }
  if (!KINDS.includes(r.kind)) e.kind = 'Select a visit type.';
  else if (r.kind === 'Other' && !r.kindOther) e.kindOther = 'Describe the visit type.';
  if (r.interpreter && !r.language) e.language = 'Select the language the interpreter must speak.';
  if (!['Routine', 'Urgent'].includes(r.priority)) e.priority = 'Select a priority.';
  return e;
}

// Cleans, checks and stores a record, then replies to the browser.
const save = (req, res, id) => {
  const r = clean(req.body);
  const errors = check(r, id);
  // 422 = "I understood the request but the data is not valid". We send the errors back
  // so the React form can show them next to the right fields.
  if (Object.keys(errors).length > 0) {
    return res.status(422).json({ message: 'Some fields need attention.', errors });
  }
  res.json(db.put({ id, ...r })); // store it and send the saved record back
};

// Reply used when an appointment id does not exist
const gone = res => res.status(404).json({ message: 'That appointment no longer exists. Return to the list to refresh it.' });

// ---------- API routes ----------

// GET: send back every appointment
app.get('/api/appointments', (req, res) => res.json(db.all()));

// POST: create a new appointment with a fresh id
app.post('/api/appointments', (req, res) => save(req, res, db.nextId()));

// PUT: update an existing appointment (the React app doesn't use this yet, but the API supports it)
app.put('/api/appointments/:id', (req, res) =>
  db.find(+req.params.id) ? save(req, res, +req.params.id) : gone(res));   // + turns the text id into a number

// DELETE: remove an appointment (also not used by the React app yet)
app.delete('/api/appointments/:id', (req, res) =>
  db.del(+req.params.id) ? res.status(204).end() : gone(res));

// PATCH: change only the status of one appointment (used by the drop-down in the table).
// We don't re-check the date here, so the status of past visits can still be updated.
app.patch('/api/appointments/:id/status', (req, res) => {
  const record = db.find(+req.params.id);
  if (!record) return gone(res);
  if (!['Scheduled', 'Completed', 'Cancelled'].includes(req.body.status)) {
    return res.status(422).json({ message: 'Choose Scheduled, Completed or Cancelled.' });
  }
  res.json(db.put({ ...record, status: req.body.status }));   // copy the record, replace only the status
});

// ---------- Everything else: show the website ----------
// This is what fixes "Cannot GET /". Any other address opens the React app's index.html.
app.get('*', (req, res) => {
  const index = path.join(dist, 'index.html');
  if (fs.existsSync(index)) {
    res.sendFile(index);
  } else {
    // The "dist" folder only exists after "npm run build", so explain instead of showing a confusing error
    res.status(503).send('The website has not been built yet. Run "npm run build" and restart the server.');
  }
});

// Error handler (must be last): catches broken JSON sent by the browser
app.use((err, req, res, next) => res.status(400).json({ message: 'The request could not be read.' }));

// Hosting services choose the port and give it to us in process.env.PORT. Locally we use 3000.
const PORT = process.env.PORT || 3000;
// Vercel imports the app; only start a listener when this file runs directly.
if (require.main === module) {
  app.listen(PORT, () => console.log('Clinic app running at http://localhost:' + PORT));
}

// Export the Express app for Vercel
module.exports = app;

