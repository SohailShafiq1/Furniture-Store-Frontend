import './SearchBar.css';

export default function SearchBar() {
  return (
    <div className="search-bar">
      <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input 
        type="text" 
        placeholder="Search products, furniture..." 
        className="search-input"
      />
    </div>
  );
}
