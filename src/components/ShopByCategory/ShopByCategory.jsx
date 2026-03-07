import './ShopByCategory.css';

const CATEGORIES = [
  {
    label: 'Living Room',
    image: '/category/living-room_da94c724-0fba-40fe-9384-303ada964589.jpg',
    href: '#living',
  },
  {
    label: 'Bedroom',
    image: '/category/bedroom_6b25cc7c-ac96-4ce7-a44f-504036ac840b.webp',
    href: '#bedroom',
  },
  {
    label: 'Mattresses',
    image: '/category/mattresses_ec5363e6-bbbc-4fad-bbbe-e63425b3f136.webp',
    href: '#mattresses',
  },
  {
    label: 'Dining Room',
    image: '/category/dining-room_24db47e1-a03a-4f00-90e5-03d00420c880.jpg',
    href: '#dining',
  },
  {
    label: 'Home Decor',
    image: '/category/home-decor_b7d0ff14-5ef1-4449-9ff6-26953227b91b.jpg',
    href: '#home-decor',
  },
  {
    label: 'Outdoor',
    image: '/category/outdoor_f897e61a-109b-4f64-a886-d630164f351b.jpg',
    href: '#outdoor',
  },
];

export default function ShopByCategory() {
  return (
    <section className="shop-by-category">
      <h2 className="category-heading">Shop by Category</h2>
      <div className="category-grid">
        {CATEGORIES.map((cat) => (
          <a key={cat.label} href={cat.href} className="category-item">
            <div className="category-circle">
              <img src={cat.image} alt={cat.label} className="category-image" />
            </div>
            <span className="category-label">{cat.label}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
