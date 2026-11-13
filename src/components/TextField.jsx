// A labelled input or text area with an optional error.
export default function TextField({ id, label, value, onChange, error, type = 'text', textarea = false, autoComplete, min, max }) {
  // Use a textarea when requested.
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <div className="field">
      {/* Connect the label to the field. */}
      <label htmlFor={id}>{label}</label>
      <Tag
        id={id}
        type={textarea ? undefined : type}
        rows={textarea ? 4 : undefined}
        value={value}
        autoComplete={autoComplete}
        min={min}
        max={max}
        onChange={e => onChange(e.target.value)} // Send the new value to the parent.
        aria-invalid={error ? 'true' : undefined} // Mark invalid input.
        aria-describedby={error ? id + '-error' : undefined} // Link the error message.
      />
      {/* Show the error message only when there is one. */}
      {error && <span className="error" id={id + '-error'}>{error}</span>}
    </div>
  );
}
