import { Link } from 'react-router-dom';
import { useCategoryData } from '../../hooks/useCategoryData';
import { BACKEND_URL } from '../../config/api';
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

  // Debug: Log categories and URLs
  categories.forEach(cat => {
    const imageUrl = cat.image?.startsWith('http') ? cat.image : `${BACKEND_URL}/${cat.image}`;
    console.log(`Category: ${cat.name}, Image Path: ${cat.image}, Full URL: ${imageUrl}`);
  });

  return (
    <section className="shop-by-category">
      <h2 className="category-heading" data-aos="fade-up">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat, idx) => {
          const imageUrl = cat.image?.startsWith('http') ? cat.image : `${BACKEND_URL}/${cat.image}`;
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
                    console.error(`Failed to load image: ${imageUrl}`, e);
                    e.target.src = '/placeholder-image.png'; // Fallback image
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
