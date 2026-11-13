// Shared app button.
export default function Button({ children, onClick, type = 'button', variant = 'primary', busy = false, current = false, label }) {
  return (
    <button
      type={type} // Use "submit" inside a form.
      className={'btn ' + variant} // Choose the style.
      onClick={onClick}
      disabled={busy} // Prevent clicks while busy.
      aria-current={current ? 'page' : undefined} // Mark the current page.
      aria-label={label} // Optional screen-reader label.
    >
      {children} {/* Button text. */}
    </button>
  );
}
