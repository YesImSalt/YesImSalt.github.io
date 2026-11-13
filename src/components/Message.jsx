// Show messages and announce them to screen readers.
export default function Message({ text, isError }) {
  return <p id="message" role="status" className={isError ? 'bad' : ''}>{text}</p>;
}
