// ============================================================
// db.js - the "database". It keeps all appointments in memory
// and copies them into data/appointments.json after every change,
// so nothing is lost when the server restarts.
// Only this file touches storage, so switching to SQLite later
// would only mean changing this file.
// ============================================================

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'appointments.json'); // where the data is saved
let rows; // the list of all appointments, kept in memory

// Write the whole list to disk.
// We write to a temporary file first, then rename it, so a crash mid-write can't corrupt the real file.
const save = () => {
  fs.mkdirSync(path.dirname(FILE), { recursive: true }); // create the data/ folder if it is missing
  fs.writeFileSync(FILE + '.tmp', JSON.stringify(rows, null, 1));
  fs.renameSync(FILE + '.tmp', FILE);
};

// On startup, try to load the saved file...
try {
  rows = JSON.parse(fs.readFileSync(FILE, 'utf8'));
} catch {
  // ...and if there isn't one yet (first run), create 120 sample appointments so the table isn't empty.
  const first = ['Amira', 'Omar', 'Layla', 'Youssef', 'Nour', 'Karim', 'Mariam', 'Tarek'];
  const last = ['Hassan', 'Khalil', 'Mostafa', 'Adel', 'Samir', 'Fathy'];
  const kinds = ['Check-up', 'Follow-up', 'Vaccination', 'Lab review'];

  rows = Array.from({ length: 120 }, (_, i) => ({
    id: i + 1,
    patient: `${first[i % 8]} ${last[i % 6]}`,
    // Dates run from 15 days ago to 104 days ahead (864e5 = milliseconds in one day)
    date: new Date(Date.now() + (i - 15) * 864e5).toLocaleDateString('en-CA'), // en-CA gives YYYY-MM-DD
    time: String(9 + (i % 8)).padStart(2, '0') + ':00',
    kind: kinds[i % 4],
    kindOther: '',
    priority: i % 7 ? 'Routine' : 'Urgent',                                  // every 7th one is urgent
    // Past appointments are Completed (or Cancelled), future ones are Scheduled
    status: i < 15 ? (i % 4 ? 'Completed' : 'Cancelled') : 'Scheduled',
    interpreter: i % 9 === 0,
    language: i % 9 === 0 ? 'Arabic' : '',
    wheelchair: i % 5 === 0,
    notes: `Sample note ${i + 1}.`
  }));
  save();
}

// The functions the rest of the server is allowed to use
module.exports = {
  // Every appointment
  all: () => rows,

  // One appointment by id (or undefined)
  find: id => rows.find(r => r.id === id),

  // The next free id: the biggest id so far, plus one
  nextId: () => Math.max(0, ...rows.map(r => r.id)) + 1,

  // Is there already an appointment for this patient at this date and time? (ignores the record being edited)
  clash: (b, id) => rows.some(r =>
    r.id !== id && r.date === b.date && r.time === b.time && r.patient.toLowerCase() === b.patient.toLowerCase()),

  // Add a new record, or replace the one with the same id, then save to disk
  put(rec) {
    const i = rows.findIndex(r => r.id === rec.id);
    i < 0 ? rows.push(rec) : (rows[i] = rec);
    save();
    return rec;
  },

  // Delete by id and save. Returns true if something was actually removed.
  del(id) {
    const before = rows.length;
    rows = rows.filter(r => r.id !== id);
    save();
    return rows.length < before;
  }
};
