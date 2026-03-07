import './StayInTouch.css';

export default function StayInTouch() {
  return (
    <section className="stay-in-touch">
      <div className="stay-container">
        <h2 className="stay-title">Stay in touch.</h2>
        <p className="stay-sub">Sign up for new arrivals, promotions, and trends.</p>
        <form className="stay-form" onSubmit={(e) => e.preventDefault()}>
          <label className="visually-hidden" htmlFor="email">Email</label>
          <input id="email" type="email" placeholder="Your email" className="stay-input" />
          <button className="stay-btn" aria-label="Subscribe">→</button>
        </form>
      </div>
    </section>
  );
}
