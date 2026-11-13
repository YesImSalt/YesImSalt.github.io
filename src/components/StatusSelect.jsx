// A status dropdown labeled with the patient's name.
export default function StatusSelect({ patient, value, onChange }) {
  return (
    <select
      className="status-select"
      value={value}
      onChange={e => onChange(e.target.value)}
      aria-label={'Status for ' + patient}
    >
      {['Scheduled', 'Completed', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
    </select>
  );
}
