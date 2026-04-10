import './PromoStrip.css';
import { useState } from 'react';

export default function PromoStrip({ title, subtitle, code }) {
  const [copied, setCopied] = useState(false);
  const promoCode = code || '';
  const hasContent = Boolean(title || subtitle || promoCode);

  if (!hasContent) {
    return null;
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="promo-strip">
      <div className="promo-strip-container">
        <div className="promo-strip-content">
          {title && <h3 className="promo-strip-title">{title}</h3>}
          {subtitle && <p className="promo-strip-subtitle">{subtitle}</p>}
        </div>
        {promoCode && (
          <div className="promo-strip-action">
            <span className="promo-code-label">{promoCode}</span>
            <button 
              className="copy-code-btn"
              onClick={handleCopyCode}
              title="Copy code"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              {copied ? 'Copied!' : 'Copy code'}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
