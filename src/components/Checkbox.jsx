// Clicking the label also toggles the checkbox.
export default function Checkbox({ id, label, checked, onChange }) {
  return (
    <label className="inline">
      <input type="checkbox" id={id} checked={checked} onChange={e => onChange(e.target.checked)} /> {label}
    </label>
  );
}
