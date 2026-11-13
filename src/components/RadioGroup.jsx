// Group radio choices so only one can be selected.
export default function RadioGroup({ legend, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend>{legend}</legend>
      {options.map(o => (
        <label key={o} className="inline">
          {/* Check the selected option. */}
          <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} /> {o}
        </label>
      ))}
    </fieldset>
  );
}
