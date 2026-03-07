import ProductCarousel from '../ProductCarousel/ProductCarousel';

export default function Sectionals() {
  const products = [
    {
      id: 1,
      image: '/download.jpeg',
      brand: 'Ashley',
      name: 'Emilia Caramel Leather 4-Piece Modular Sectional',
      rating: 5,
      reviews: 23,
      currentPrice: '$2,619.00',
      originalPrice: '$4,709.00',
      badge: 'Spring Sale',
      stockStatus: null,
    },
    {
      id: 2,
      image: '/download (1).jpeg',
      brand: 'Ashley',
      name: 'Emilia Black 5-Piece Leather Modular Sectional',
      rating: 5,
      reviews: 11,
      currentPrice: '$3,119.00',
      originalPrice: '$5,729.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
    {
      id: 3,
      image: '/download (2).jpeg',
      brand: 'Ashley',
      name: 'Midnight-Madness Onyx 3-Piece Double Chaise Sectional',
      rating: 4.5,
      reviews: 21,
      currentPrice: '$1,359.00',
      originalPrice: '$2,439.00',
      badge: 'Spring Sale',
      stockStatus: null,
    },
    {
      id: 4,
      image: '/download (3).jpeg',
      brand: 'Nova Furniture',
      name: 'Bedlington Ivory Boucle RAF Curved Sectional',
      rating: 5,
      reviews: 9,
      currentPrice: '$999.00',
      originalPrice: '$3,819.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock | Ready to Go',
    },
    {
      id: 5,
      image: '/images.jpeg',
      brand: 'Ashley',
      name: 'Lindyn Ivory 2-Piece RAF Chaise Sectional',
      rating: 4.5,
      reviews: 12,
      currentPrice: '$1,089.00',
      originalPrice: '$1,949.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
  ];

  return <ProductCarousel title="Sectionals" products={products} />;
}
