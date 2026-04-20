import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL } from '../config/api';
import { getAlternateImageUrl, getImageUrl } from '../utils/imageUrl';
import './DealsCollectionPage.css';

const buildTargetPath = (target = {}) => {
  const type = target?.targetType;

  if (type === 'product' && target?.productId && target?.categoryId) {
    return `/product/${target.categoryId}/${target.productId}`;
  }

  if (!target?.categoryId) return '/deals';

  if (type === 'category') {
    return `/category/${target.categoryId}`;
  }

  if (type === 'subCategory') {
    if (!target?.subCategoryName) return `/category/${target.categoryId}`;
    return `/category/${target.categoryId}/sub/${encodeURIComponent(target.subCategoryName)}`;
  }

  if (type === 'subSubCategory') {
    if (!target?.subCategoryName) return `/category/${target.categoryId}`;
    const base = `/category/${target.categoryId}/sub/${encodeURIComponent(target.subCategoryName)}`;
    if (!target?.subSubCategoryName) return base;
    return `${base}?subSub=${encodeURIComponent(target.subSubCategoryName)}`;
  }

  return `/category/${target.categoryId}`;
};

export default function DealsCollectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${API_BASE_URL}/collections/all`, []);
  const requestedName = useMemo(
    () => new URLSearchParams(location.search).get('name')?.trim() || '',
    [location.search]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadCollection = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load collection (${res.status})`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        if (!requestedName) {
          setCollection(list[0] || null);
          return;
        }

        const requestedNameLower = requestedName.toLowerCase();
        const found =
          list.find((item) => (item?.name || '').toLowerCase() === requestedNameLower) ||
          list.find((item) => (item?.mainBanner?.title || '').toLowerCase() === requestedNameLower) ||
          list.find((item) => (item?.name || '').toLowerCase().includes(requestedNameLower));

        setCollection(found || list[0] || null);
      } catch (e) {
        setCollection(null);
        setError(e.message || 'Failed to load collection');
      } finally {
        setLoading(false);
      }
    };

    loadCollection();
  }, [endpoint, requestedName]);

  return (
    <>
      <Header />
      <div className="deals-collection-page">
        <div className="collection-breadcrumb">
          <span onClick={() => navigate('/')} role="button" tabIndex={0}>
            Home
          </span>
          <span className="sep">&gt;</span>
          <span>{collection?.name || 'Collection'}</span>
        </div>

        <section className="collection-main-banner">
          <div className="collection-main-banner-content">
            <h1>{collection?.mainBanner?.title || 'Bedroom'}</h1>
            <h3>{collection?.mainBanner?.saleSubtitle || 'SPRING SALE: UP TO 70% OFF'}</h3>
            <p>
              {collection?.mainBanner?.description ||
                'Explore stylish, affordable bedroom collections for your comfort.'}
            </p>
          </div>
        </section>

        <main className="collection-content">
          {loading && <div className="collection-state">Loading collection...</div>}
          {!loading && error && <div className="collection-state error">{error}</div>}
          {!loading && !error && !collection && (
            <div className="collection-state">No collection available right now.</div>
          )}

          {!loading && !error && collection && (
            <>
              <section className="collection-products-section">
                <div className="collection-products-grid">
                  {(collection.collectionItems || []).map((item, idx) => (
                    <article
                      className="collection-product-card"
                      key={`${item.name}-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigate(buildTargetPath(item.target))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(buildTargetPath(item.target));
                        }
                      }}
                    >
                      <div className="collection-product-image-wrap">
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name || 'Collection item'}
                          onError={(e) => {
                            const currentSrc = e.currentTarget.src;
                            const alternateUrl = getAlternateImageUrl(currentSrc, item.image);
                            if (alternateUrl && alternateUrl !== currentSrc) {
                              e.currentTarget.src = alternateUrl;
                            } else {
                              e.currentTarget.onerror = null;
                            }
                          }}
                        />
                      </div>
                      <h4>{item.name}</h4>
                    </article>
                  ))}
                </div>
              </section>

              {collection.dealBox && (
                <section className="collection-deal-box">
                  <div className="deal-box-media">
                    <img
                      src={getImageUrl(collection.dealBox.image)}
                      alt={collection.dealBox.title || 'Deal box image'}
                      onError={(e) => {
                        const currentSrc = e.currentTarget.src;
                        const alternateUrl = getAlternateImageUrl(currentSrc, collection.dealBox.image);
                        if (alternateUrl && alternateUrl !== currentSrc) {
                          e.currentTarget.src = alternateUrl;
                        } else {
                          e.currentTarget.onerror = null;
                        }
                      }}
                    />
                  </div>
                  <div className="deal-box-content">
                    <h2>{collection.dealBox.title}</h2>
                    <p>{collection.dealBox.description}</p>
                    <button
                      type="button"
                      onClick={() => navigate(buildTargetPath(collection.dealBox.buttonTarget))}
                    >
                      {collection.dealBox.buttonName}
                    </button>
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
