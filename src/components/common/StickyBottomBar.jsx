import { useLocation } from 'react-router-dom';
import './StickyBottomBar.css';

const HIDDEN_PREFIX_PATHS = ['/admin', '/order-success'];
const HIDDEN_EXACT_PATHS = ['/checkout'];
const APPLY_NOW_URL = 'http://subscribe.podium.com/Diamond-Modern-Furniture';

function StickyBottomBar() {
  const location = useLocation();
  const pathname = location.pathname || '';

  const shouldHide =
    HIDDEN_EXACT_PATHS.includes(pathname) ||
    HIDDEN_PREFIX_PATHS.some((prefix) => pathname.startsWith(prefix));

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <div className="sticky-bottom-bar-spacer" aria-hidden="true" />
      <div className="sticky-bottom-bar" role="region" aria-label="Financing action bar">
        <div className="sticky-bottom-bar__inner">
          <p className="sticky-bottom-bar__label">Get Approved Today</p>
          <button
            type="button"
            className="sticky-bottom-bar__button"
            onClick={() => {
              window.location.href = APPLY_NOW_URL;
            }}
          >
            Apply Now!
          </button>
        </div>
      </div>
    </>
  );
}

export default StickyBottomBar;
