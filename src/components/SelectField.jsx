// A labelled dropdown with an optional placeholder and error.
export default function SelectField({ id, label, value, onChange, options, placeholder, error }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? id + '-error' : undefined}
      >
        {/* Show a placeholder when provided. */}
        {placeholder && <option value="">{placeholder}</option>}
        {/* Add an option for each choice. */}
        {options.map(option => <option key={option}>{option}</option>)}
      </select>
      {error && <span className="error" id={id + '-error'}>{error}</span>}
    </div>
  );
}
