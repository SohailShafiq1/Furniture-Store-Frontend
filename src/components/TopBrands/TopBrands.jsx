import './TopBrands.css';

export default function TopBrands() {
  const brands = [
    { id: 1, name: 'Ashley', logo: '/logo.avif' },
    { id: 2, name: 'Coaster', logo: '/logo.avif' },
    { id: 3, name: 'Crown Mark', logo: '/logo.avif' },
    { id: 4, name: 'Happy Homes', logo: '/logo.avif' },
    { id: 5, name: 'Home Range', logo: '/logo.avif' },
    { id: 6, name: 'Furniture of America', logo: '/logo.avif' }
  ];

  return (
    <section className="top-brands">
      <div className="top-brands-container">
        <h2 className="top-brands-title">Top Brands at the Best Prices</h2>
        <div className="brands-grid">
          {brands.map((brand) => (
            <div key={brand.id} className="brand-item">
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="brand-logo"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
