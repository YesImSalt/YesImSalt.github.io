import { useState, useRef, useEffect } from 'react';
import TextField from '../components/TextField';
import SelectField from '../components/SelectField';
import StatusSelect from '../components/StatusSelect';
import Button from '../components/Button';

// Map sort labels to data fields.
const SORTS = { 'Date': 'date', 'Patient': 'patient', 'Visit type': 'kind', 'Priority': 'priority', 'Status': 'status' };

// Appointments per page.
const PER_PAGE = 50;

// Show a dash visually and "none" to screen readers.
const orDash = value => value || (<><span aria-hidden="true">-</span><span className="sr">none</span></>);

// Describe the patient's needs.
function needsText(a) {
  const needs = [];
  if (a.interpreter) needs.push('Interpreter (' + a.language + ')');
  if (a.wheelchair) needs.push('Wheelchair access');
  return needs.join(', '); // Empty needs show as a dash.
}

// Search, sort, filter, and update appointments.
export default function AppointmentList({ appointments, loading, go, onStatusChange }) {
  const [search, setSearch] = useState(''); // Search text.
  const [status, setStatus] = useState(''); // Status filter.
  const [sortLabel, setSortLabel] = useState('Date'); // Sort order.
  const [page, setPage] = useState(1); // Current page.
  const tableBox = useRef(null); // Scroll the table to the top.

  // Data field used for sorting.
  const key = SORTS[sortLabel];

  // Put urgent appointments first.
  const sortValue = a => {
    if (key === 'date') return a.date + a.time; // Sort by date and time.
    if (key === 'priority') return a.priority === 'Urgent' ? '0' : '1';
    return a[key];
  };

  // Filter and sort appointments.
  const filtered = appointments
    .filter(a => !status || a.status === status)
    .filter(a => (a.patient + ' ' + a.kind + ' ' + (a.notes || ''))
      .toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortValue(a).localeCompare(sortValue(b)));

  // Work out which appointments belong on this page.
  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const first = (current - 1) * PER_PAGE;
  const shown = filtered.slice(first, first + PER_PAGE);

  // Scroll to the top when the page changes.
  useEffect(() => {
    if (tableBox.current) tableBox.current.scrollTop = 0;
  }, [current]);

  // Reset to page one when filters change.
  const changeSearch = v => { setSearch(v); setPage(1); };
  const changeStatusFilter = v => { setStatus(v); setPage(1); };
  const changeSort = v => { setSortLabel(v); setPage(1); };

  // Clear the search and status filter.
  function clearFilters() {
    changeSearch('');
    setStatus('');
  }

  return (
    <section>
      <h1 tabIndex="-1">All appointments</h1>

      {/* Search, filter, and sort controls. */}
      <div className="filters">
        <TextField id="search" label="Search patient, visit type or notes" type="search" value={search} onChange={changeSearch} />
        <SelectField id="status-filter" label="Status" value={status} onChange={changeStatusFilter}
          placeholder="All statuses" options={['Scheduled', 'Completed', 'Cancelled']} />
        <SelectField id="sort" label="Sort by" value={sortLabel} onChange={changeSort} options={Object.keys(SORTS)} />
      </div>

      {/* Announce the result count to screen readers. */}
      <p role="status">
        {loading
          ? 'Loading appointments…'
          : filtered.length === 0
            ? 'No appointments found.'
            : `Showing ${first + 1}–${first + shown.length} of ${filtered.length} appointments${filtered.length < appointments.length ? ` (filtered from ${appointments.length})` : ''}, sorted by ${sortLabel.toLowerCase()}.`}
      </p>

      {/* Scrollable appointment table. */}
      <div className="table-box" ref={tableBox} role="region" aria-label="Appointments table" tabIndex="0">
        <table>
          <caption className="sr">Appointments</caption>
          <thead>
            <tr>
              {/* Column headings. */}
              <th scope="col">Patient</th><th scope="col">Date and time</th><th scope="col">Visit type</th>
              <th scope="col">Priority</th><th scope="col">Status</th>
              <th scope="col">Patient needs</th><th scope="col">Notes</th>
            </tr>
          </thead>
          <tbody>
            {/* Show this page's appointments. */}
            {shown.map(a => (
              <tr key={a.id}>
                {/* Use the patient name as the row heading. */}
                <th scope="row">{a.patient}</th>
                <td>{a.date} {a.time}</td>
                {/* Show the custom visit type. */}
                <td>{a.kind === 'Other' ? a.kindOther : a.kind}</td>
                {/* Mark urgent visits without relying on color. */}
                <td>{a.priority === 'Urgent' ? '⚠ Urgent' : 'Routine'}</td>
                {/* Change the status here. */}
                <td><StatusSelect patient={a.patient} value={a.status} onChange={s => onStatusChange(a, s)} /></td>
                {/* Show optional needs. */}
                <td>{orDash(needsText(a))}</td>
                {/* Long notes wrap in this column. */}
                <td className="notes-cell">{orDash(a.notes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show actions when there are no matches. */}
      {!loading && filtered.length === 0 && (
        <div>
          <p>No appointments match your search or filter.</p>
          <div className="actions">
            <Button variant="alt" onClick={clearFilters}>Clear filters</Button>
            <Button onClick={() => go('add')}>New appointment</Button>
          </div>
        </div>
      )}

      {/* Move between pages. */}
      {!loading && (
        <nav className="pager" aria-label="Pagination">
          <Button variant="alt" busy={current === 1} onClick={() => setPage(current - 1)}>Previous</Button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
            <Button key={n} label={'Page ' + n} variant={n === current ? 'primary' : 'alt'} current={n === current} onClick={() => setPage(n)}>
              {n}
            </Button>
          ))}
          <Button variant="alt" busy={current === pages} onClick={() => setPage(current + 1)}>Next</Button>
        </nav>
      )}
    </section>
  );
}
