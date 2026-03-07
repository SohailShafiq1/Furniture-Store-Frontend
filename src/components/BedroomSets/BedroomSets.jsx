import ProductCarousel from '../ProductCarousel/ProductCarousel';

export default function BedroomSets() {
  const products = [
    {
      id: 1,
      image: '/download.jpeg',
      brand: 'Crown Mark',
      name: 'Cameo Black Upholstered Panel Bedroom Set',
      rating: 5,
      reviews: 1,
      currentPrice: 'From $659.00',
      originalPrice: '$1,319.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
    {
      id: 2,
      image: '/download (1).jpeg',
      brand: 'Ashley',
      name: 'Montelaine Antique White Upholstered Panel Bedroom Set',
      rating: 5,
      reviews: 11,
      currentPrice: 'From $869.00',
      originalPrice: '$1,549.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
    {
      id: 3,
      image: '/download (2).jpeg',
      brand: 'Crown Mark',
      name: 'Millie Brownish Gray Panel Bedroom Set',
      rating: 4.5,
      reviews: 9,
      currentPrice: 'From $219.00',
      originalPrice: '$439.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
    {
      id: 4,
      image: '/download (3).jpeg',
      brand: 'Ashley',
      name: 'Sturiayne Brown Upholstered Panel Bedroom Set',
      rating: 5,
      reviews: 11,
      currentPrice: 'From $1,019.00',
      originalPrice: '$1,829.00',
      badge: 'Spring Sale',
      stockStatus: null,
    },
    {
      id: 5,
      image: '/images.jpeg',
      brand: 'Crown Mark',
      name: 'Sawyer Antique White/Brown Panel Bedroom Set',
      rating: 5,
      reviews: 11,
      currentPrice: 'From $499.00',
      originalPrice: '$999.00',
      badge: 'Spring Sale',
      stockStatus: 'In Stock',
    },
  ];

  return <ProductCarousel title="Bedroom Sets" products={products} />;
}
