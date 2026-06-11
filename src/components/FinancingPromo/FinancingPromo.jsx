import { useNavigate } from 'react-router-dom';
import './FinancingPromo.css';

export default function FinancingPromo() {
  const navigate = useNavigate();

  return (
    <section className="financing-promo">
      <div className="financing-promo-inner">
        <span className="financing-promo-tag">BUY NOW, PAY OVER TIME.</span>
        <h2 className="financing-promo-title">
          <span className="financing-promo-title-desktop">
            We offer a range of flexible
            <br />
            financing options tailored to your
            <br />
            specific needs.
          </span>
          <span className="financing-promo-title-mobile" aria-hidden="true">
            We offer a range of
            <br />
            flexible financing
            <br />
            options tailored to
            <br />
            your specific needs.
          </span>
        </h2>
        <button
          className="financing-promo-button"
          type="button"
          onClick={() => {
            navigate('/financing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          Check Purchase Options 
        </button>
      </div>
    </section>
  );
}
