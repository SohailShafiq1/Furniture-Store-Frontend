import { Link } from 'react-router-dom';
import { useCategoryData } from '../../hooks/useCategoryData';
import { getAlternateImageUrl, getImageUrl } from '../../utils/imageUrl';
import './ShopByCategory.css';

export default function ShopByCategory() {
  const { categories, loading } = useCategoryData();

  if (loading) {
    return (
      <section className="shop-by-category">
        <h2 className="category-heading">Shop by Category</h2>
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading categories...</div>
      </section>
    );
  }

  return (
    <section className="shop-by-category">
      <h2 className="category-heading" data-aos="fade-up">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat, idx) => {
          const imageUrl = getImageUrl(cat.image);
          return (
            <Link 
              key={cat._id} 
              to={`/category/${cat._id}`} 
              className="category-item"
              data-aos="zoom-in"
              data-aos-delay={idx * 50}
            >
              <div className="category-circle">
                <img 
                  src={imageUrl} 
                  alt={cat.name} 
                  className="category-image" 
                  loading="lazy"
                  onError={(e) => {
                    const currentSrc = e.currentTarget.src;
                    const alternateUrl = getAlternateImageUrl(currentSrc, cat.image);

                    if (alternateUrl && alternateUrl !== currentSrc) {
                      e.currentTarget.src = alternateUrl;
                    } else {
                      e.currentTarget.onerror = null;
                    }
                  }}
                />
              </div>
              <span className="category-label">{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
