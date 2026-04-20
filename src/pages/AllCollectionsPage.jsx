import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { API_BASE_URL } from '../config/api';
import { getAlternateImageUrl, getImageUrl } from '../utils/imageUrl';
import './AllCollectionsPage.css';

const buildTargetPath = (collectionName = '') => {
  if (collectionName) {
    return `/deals/collection?name=${encodeURIComponent(collectionName)}`;
  }

  return '/deals/collection';
};

export default function AllCollectionsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const endpoint = useMemo(() => `${API_BASE_URL}/collections/all`, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`Failed to load collections (${res.status})`);

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const allItems = list.flatMap((collection) =>
          Array.isArray(collection?.collectionItems)
            ? collection.collectionItems.map((item) => ({
                name: item?.name || collection?.name || 'Collection Item',
                image: item?.image || '',
                collectionName: collection?.name || ''
              }))
            : []
        );

        setItems(allItems);
      } catch (e) {
        setItems([]);
        setError(e.message || 'Failed to load collections');
      } finally {
        setLoading(false);
      }
    };

    loadCollections();
  }, [endpoint]);

  return (
    <>
      <Header />
      <main className="all-collections-page">
        <div className="all-collections-container">
          <h1>Collections</h1>

          {loading && <div className="all-collections-state">Loading collections...</div>}
          {!loading && error && <div className="all-collections-state error">{error}</div>}
          {!loading && !error && items.length === 0 && (
            <div className="all-collections-state">No collections found.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <section className="all-collections-row" aria-label="All collections row">
              {items.map((item, index) => (
                <article
                  className="all-collection-card"
                  key={`${item.name}-${index}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(buildTargetPath(item.collectionName))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(buildTargetPath(item.collectionName));
                    }
                  }}
                >
                  <div className="all-collection-image-wrap">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      loading="lazy"
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
                  <h3>{item.name}</h3>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
