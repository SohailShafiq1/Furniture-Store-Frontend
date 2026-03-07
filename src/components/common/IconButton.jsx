import './IconButton.css';

export default function IconButton({ icon, label, onClick }) {
  return (
    <button className="icon-button" onClick={onClick} title={label}>
      {icon}
      <span className="icon-label">{label}</span>
    </button>
  );
}
