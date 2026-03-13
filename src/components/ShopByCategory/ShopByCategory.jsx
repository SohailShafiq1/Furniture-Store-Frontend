import { Link } from 'react-router-dom';
import { useCategoryData } from '../../hooks/useCategoryData';
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
      <h2 className="category-heading">Shop by Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link 
            key={cat._id} 
            to={`/category/${cat._id}`} 
            className="category-item"
          >
            <div className="category-circle">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="category-image" 
                loading="lazy"
              />
            </div>
            <span className="category-label">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
