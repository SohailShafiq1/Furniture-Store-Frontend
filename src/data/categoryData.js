// Category data with products
export const CATEGORIES = {
  'living-room': {
    name: 'Living Room',
    image: '/category/living-room_da94c724-0fba-40fe-9384-303ada964589.jpg',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/living-room_da94c724-0fba-40fe-9384-303ada964589.jpg', theme: 'orange' },
      { id: 'in-stock', label: 'In-Stock', image: '/download.jpeg', theme: 'orange-stock' },
      { id: 'under-549', label: 'Under $549', image: '/download (1).jpeg', theme: 'teal' },
      { id: 'exclusive', label: 'Exclusive', image: '/download (2).jpeg', theme: 'dark' },
      { id: 'new', label: 'New Arrivals', image: '/download (3).jpeg', theme: 'blue' },
      { id: 'sofas', label: 'Sofas', image: '/images.jpeg', theme: 'default' },
      { id: 'sectionals', label: 'Sectionals', image: '/download.jpeg', theme: 'default' },
      { id: 'loveseats', label: 'Loveseats', image: '/download (1).jpeg', theme: 'default' },
      { id: 'chairs', label: 'Chairs', image: '/download (2).jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 1, name: 'Contemporary Sofa', price: 899, originalPrice: 1299, rating: 4.5, reviews: 23, brand: 'Ashley Furniture', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'living-room' },
        { id: 2, name: 'Leather Sectional', price: 1499, originalPrice: 1999, rating: 4.7, reviews: 45, brand: 'Wayfair', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'living-room' },
        { id: 3, name: 'Modern Loveseat', price: 549, originalPrice: 799, rating: 4.3, reviews: 18, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'living-room' },
        { id: 4, name: 'Recliner Chair', price: 399, originalPrice: 599, rating: 4.6, reviews: 32, brand: 'La-Z-Boy', badge: 'In Stock', inStock: true, image: '/download (3).jpeg', category: 'living-room' },
        { id: 5, name: 'Chesterfield Sofa', price: 1299, originalPrice: 1799, rating: 4.8, reviews: 56, brand: 'Pottery Barn', badge: 'Exclusive', inStock: true, image: '/images.jpeg', category: 'living-room' },
        { id: 6, name: 'Velvet Armchair', price: 449, originalPrice: 649, rating: 4.4, reviews: 27, brand: 'West Elm', badge: 'New Arrival', inStock: true, image: '/download.jpeg', category: 'living-room' },
      ],
      'in-stock': [
        { id: 2, name: 'Leather Sectional', price: 1499, originalPrice: 1999, rating: 4.7, reviews: 45, brand: 'Wayfair', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'living-room' },
        { id: 4, name: 'Recliner Chair', price: 399, originalPrice: 599, rating: 4.6, reviews: 32, brand: 'La-Z-Boy', badge: 'In Stock', inStock: true, image: '/download (3).jpeg', category: 'living-room' },
      ],
      'under-549': [
        { id: 3, name: 'Modern Loveseat', price: 549, originalPrice: 799, rating: 4.3, reviews: 18, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'living-room' },
        { id: 4, name: 'Recliner Chair', price: 399, originalPrice: 599, rating: 4.6, reviews: 32, brand: 'La-Z-Boy', badge: 'In Stock', inStock: true, image: '/download (3).jpeg', category: 'living-room' },
        { id: 6, name: 'Velvet Armchair', price: 449, originalPrice: 649, rating: 4.4, reviews: 27, brand: 'West Elm', badge: 'New Arrival', inStock: true, image: '/download.jpeg', category: 'living-room' },
      ],
      exclusive: [
        { id: 5, name: 'Chesterfield Sofa', price: 1299, originalPrice: 1799, rating: 4.8, reviews: 56, brand: 'Pottery Barn', badge: 'Exclusive', inStock: true, image: '/images.jpeg', category: 'living-room' },
      ],
      new: [
        { id: 6, name: 'Velvet Armchair', price: 449, originalPrice: 649, rating: 4.4, reviews: 27, brand: 'West Elm', badge: 'New Arrival', inStock: true, image: '/download.jpeg', category: 'living-room' },
      ],
      sofas: [
        { id: 1, name: 'Contemporary Sofa', price: 899, originalPrice: 1299, rating: 4.5, reviews: 23, brand: 'Ashley Furniture', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'living-room' },
        { id: 5, name: 'Chesterfield Sofa', price: 1299, originalPrice: 1799, rating: 4.8, reviews: 56, brand: 'Pottery Barn', badge: 'Exclusive', inStock: true, image: '/images.jpeg', category: 'living-room' },
      ],
      sectionals: [
        { id: 2, name: 'Leather Sectional', price: 1499, originalPrice: 1999, rating: 4.7, reviews: 45, brand: 'Wayfair', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'living-room' },
      ],
      loveseats: [
        { id: 3, name: 'Modern Loveseat', price: 549, originalPrice: 799, rating: 4.3, reviews: 18, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'living-room' },
      ],
      chairs: [
        { id: 4, name: 'Recliner Chair', price: 399, originalPrice: 599, rating: 4.6, reviews: 32, brand: 'La-Z-Boy', badge: 'In Stock', inStock: true, image: '/download (3).jpeg', category: 'living-room' },
        { id: 6, name: 'Velvet Armchair', price: 449, originalPrice: 649, rating: 4.4, reviews: 27, brand: 'West Elm', badge: 'New Arrival', inStock: true, image: '/download.jpeg', category: 'living-room' },
      ],
    }
  },
  'bedroom': {
    name: 'Bedroom',
    image: '/category/bedroom_6b25cc7c-ac96-4ce7-a44f-504036ac840b.webp',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/bedroom_6b25cc7c-ac96-4ce7-a44f-504036ac840b.webp', theme: 'orange' },
      { id: 'in-stock', label: 'In-Stock', image: '/download.jpeg', theme: 'orange-stock' },
      { id: 'under-549', label: 'Under $549', image: '/download (1).jpeg', theme: 'teal' },
      { id: 'beds', label: 'Beds', image: '/download (2).jpeg', theme: 'default' },
      { id: 'dressers', label: 'Dressers', image: '/download (3).jpeg', theme: 'default' },
      { id: 'nightstands', label: 'Nightstands', image: '/images.jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 7, name: 'Queen Platform Bed', price: 799, originalPrice: 1099, rating: 4.6, reviews: 38, brand: 'Crate & Barrel', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'bedroom' },
        { id: 8, name: 'Modern Dresser', price: 649, originalPrice: 899, rating: 4.5, reviews: 29, brand: 'West Elm', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'bedroom' },
        { id: 9, name: 'Wooden Nightstand', price: 199, originalPrice: 299, rating: 4.4, reviews: 41, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'bedroom' },
        { id: 10, name: 'King Upholstered Bed', price: 1299, originalPrice: 1699, rating: 4.9, reviews: 62, brand: 'Pottery Barn', badge: 'Exclusive', inStock: true, image: '/download (3).jpeg', category: 'bedroom' },
        { id: 11, name: '6-Drawer Dresser', price: 549, originalPrice: 749, rating: 4.3, reviews: 25, brand: 'Ashley Furniture', badge: 'In Stock', inStock: true, image: '/images.jpeg', category: 'bedroom' },
      ],
      'in-stock': [
        { id: 8, name: 'Modern Dresser', price: 649, originalPrice: 899, rating: 4.5, reviews: 29, brand: 'West Elm', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'bedroom' },
        { id: 11, name: '6-Drawer Dresser', price: 549, originalPrice: 749, rating: 4.3, reviews: 25, brand: 'Ashley Furniture', badge: 'In Stock', inStock: true, image: '/images.jpeg', category: 'bedroom' },
      ],
      'under-549': [
        { id: 9, name: 'Wooden Nightstand', price: 199, originalPrice: 299, rating: 4.4, reviews: 41, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'bedroom' },
        { id: 11, name: '6-Drawer Dresser', price: 549, originalPrice: 749, rating: 4.3, reviews: 25, brand: 'Ashley Furniture', badge: 'In Stock', inStock: true, image: '/images.jpeg', category: 'bedroom' },
      ],
      beds: [
        { id: 7, name: 'Queen Platform Bed', price: 799, originalPrice: 1099, rating: 4.6, reviews: 38, brand: 'Crate & Barrel', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'bedroom' },
        { id: 10, name: 'King Upholstered Bed', price: 1299, originalPrice: 1699, rating: 4.9, reviews: 62, brand: 'Pottery Barn', badge: 'Exclusive', inStock: true, image: '/download (3).jpeg', category: 'bedroom' },
      ],
      dressers: [
        { id: 8, name: 'Modern Dresser', price: 649, originalPrice: 899, rating: 4.5, reviews: 29, brand: 'West Elm', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'bedroom' },
        { id: 11, name: '6-Drawer Dresser', price: 549, originalPrice: 749, rating: 4.3, reviews: 25, brand: 'Ashley Furniture', badge: 'In Stock', inStock: true, image: '/images.jpeg', category: 'bedroom' },
      ],
      nightstands: [
        { id: 9, name: 'Wooden Nightstand', price: 199, originalPrice: 299, rating: 4.4, reviews: 41, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'bedroom' },
      ],
    }
  },
  'mattresses': {
    name: 'Mattresses',
    image: '/category/mattresses_ec5363e6-bbbc-4fad-bbbe-e63425b3f136.webp',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/mattresses_ec5363e6-bbbc-4fad-bbbe-e63425b3f136.webp', theme: 'orange' },
      { id: 'memory-foam', label: 'Memory Foam', image: '/download.jpeg', theme: 'default' },
      { id: 'hybrid', label: 'Hybrid', image: '/download (1).jpeg', theme: 'default' },
      { id: 'innerspring', label: 'Innerspring', image: '/download (2).jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 12, name: 'Memory Foam Queen', price: 699, originalPrice: 999, rating: 4.7, reviews: 156, brand: 'Tempur-Pedic', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'mattresses' },
        { id: 13, name: 'Hybrid King Mattress', price: 1199, originalPrice: 1599, rating: 4.8, reviews: 203, brand: 'Sealy', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'mattresses' },
        { id: 14, name: 'Innerspring Full', price: 449, originalPrice: 649, rating: 4.4, reviews: 89, brand: 'Serta', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'mattresses' },
      ],
      'memory-foam': [
        { id: 12, name: 'Memory Foam Queen', price: 699, originalPrice: 999, rating: 4.7, reviews: 156, brand: 'Tempur-Pedic', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'mattresses' },
      ],
      hybrid: [
        { id: 13, name: 'Hybrid King Mattress', price: 1199, originalPrice: 1599, rating: 4.8, reviews: 203, brand: 'Sealy', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'mattresses' },
      ],
      innerspring: [
        { id: 14, name: 'Innerspring Full', price: 449, originalPrice: 649, rating: 4.4, reviews: 89, brand: 'Serta', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'mattresses' },
      ],
    }
  },
  'dining': {
    name: 'Dining Room',
    image: '/category/dining-room_24db47e1-a03a-4f00-90e5-03d00420c880.jpg',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/dining-room_24db47e1-a03a-4f00-90e5-03d00420c880.jpg', theme: 'orange' },
      { id: 'tables', label: 'Dining Tables', image: '/download.jpeg', theme: 'default' },
      { id: 'chairs', label: 'Dining Chairs', image: '/download (1).jpeg', theme: 'default' },
      { id: 'sets', label: 'Dining Sets', image: '/download (2).jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 15, name: 'Farmhouse Dining Table', price: 899, originalPrice: 1299, rating: 4.6, reviews: 47, brand: 'Crate & Barrel', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'dining' },
        { id: 16, name: 'Upholstered Dining Chair', price: 199, originalPrice: 299, rating: 4.5, reviews: 68, brand: 'West Elm', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'dining' },
        { id: 17, name: '7-Piece Dining Set', price: 1599, originalPrice: 2199, rating: 4.8, reviews: 91, brand: 'Ashley Furniture', badge: 'Exclusive', inStock: true, image: '/download (2).jpeg', category: 'dining' },
      ],
      tables: [
        { id: 15, name: 'Farmhouse Dining Table', price: 899, originalPrice: 1299, rating: 4.6, reviews: 47, brand: 'Crate & Barrel', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'dining' },
      ],
      chairs: [
        { id: 16, name: 'Upholstered Dining Chair', price: 199, originalPrice: 299, rating: 4.5, reviews: 68, brand: 'West Elm', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'dining' },
      ],
      sets: [
        { id: 17, name: '7-Piece Dining Set', price: 1599, originalPrice: 2199, rating: 4.8, reviews: 91, brand: 'Ashley Furniture', badge: 'Exclusive', inStock: true, image: '/download (2).jpeg', category: 'dining' },
      ],
    }
  },
  'home-decor': {
    name: 'Home Decor',
    image: '/category/home-decor_b7d0ff14-5ef1-4449-9ff6-26953227b91b.jpg',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/home-decor_b7d0ff14-5ef1-4449-9ff6-26953227b91b.jpg', theme: 'orange' },
      { id: 'rugs', label: 'Rugs', image: '/download.jpeg', theme: 'default' },
      { id: 'lighting', label: 'Lighting', image: '/download (1).jpeg', theme: 'default' },
      { id: 'mirrors', label: 'Mirrors', image: '/download (2).jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 18, name: 'Modern Area Rug 8x10', price: 349, originalPrice: 499, rating: 4.5, reviews: 124, brand: 'Wayfair', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'home-decor' },
        { id: 19, name: 'Floor Lamp', price: 149, originalPrice: 229, rating: 4.3, reviews: 57, brand: 'IKEA', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'home-decor' },
        { id: 20, name: 'Wall Mirror 36"', price: 199, originalPrice: 299, rating: 4.6, reviews: 82, brand: 'West Elm', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'home-decor' },
      ],
      rugs: [
        { id: 18, name: 'Modern Area Rug 8x10', price: 349, originalPrice: 499, rating: 4.5, reviews: 124, brand: 'Wayfair', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'home-decor' },
      ],
      lighting: [
        { id: 19, name: 'Floor Lamp', price: 149, originalPrice: 229, rating: 4.3, reviews: 57, brand: 'IKEA', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'home-decor' },
      ],
      mirrors: [
        { id: 20, name: 'Wall Mirror 36"', price: 199, originalPrice: 299, rating: 4.6, reviews: 82, brand: 'West Elm', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'home-decor' },
      ],
    }
  },
  'outdoor': {
    name: 'Outdoor',
    image: '/category/outdoor_f897e61a-109b-4f64-a886-d630164f351b.jpg',
    subcategories: [
      { id: 'all', label: 'Shop ALL', image: '/category/outdoor_f897e61a-109b-4f64-a886-d630164f351b.jpg', theme: 'orange' },
      { id: 'patio', label: 'Patio Sets', image: '/download.jpeg', theme: 'default' },
      { id: 'lounge', label: 'Lounge Chairs', image: '/download (1).jpeg', theme: 'default' },
      { id: 'umbrellas', label: 'Umbrellas', image: '/download (2).jpeg', theme: 'default' },
    ],
    products: {
      all: [
        { id: 21, name: '5-Piece Patio Set', price: 799, originalPrice: 1099, rating: 4.7, reviews: 93, brand: 'Hampton Bay', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'outdoor' },
        { id: 22, name: 'Wicker Lounge Chair', price: 299, originalPrice: 449, rating: 4.4, reviews: 65, brand: 'Wayfair', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'outdoor' },
        { id: 23, name: 'Patio Umbrella 9ft', price: 149, originalPrice: 219, rating: 4.5, reviews: 48, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'outdoor' },
      ],
      patio: [
        { id: 21, name: '5-Piece Patio Set', price: 799, originalPrice: 1099, rating: 4.7, reviews: 93, brand: 'Hampton Bay', badge: 'Spring Sale', inStock: true, image: '/download.jpeg', category: 'outdoor' },
      ],
      lounge: [
        { id: 22, name: 'Wicker Lounge Chair', price: 299, originalPrice: 449, rating: 4.4, reviews: 65, brand: 'Wayfair', badge: 'In Stock', inStock: true, image: '/download (1).jpeg', category: 'outdoor' },
      ],
      umbrellas: [
        { id: 23, name: 'Patio Umbrella 9ft', price: 149, originalPrice: 219, rating: 4.5, reviews: 48, brand: 'IKEA', badge: 'Spring Sale', inStock: true, image: '/download (2).jpeg', category: 'outdoor' },
      ],
    }
  }
};

// Helper functions
export const getProducts = (categoryId, subcategoryId = 'all') => {
  const category = CATEGORIES[categoryId];
  if (!category) return [];
  
  return category.products[subcategoryId] || category.products.all || [];
};

export const getMainCategories = () => {
  return Object.keys(CATEGORIES).map(key => ({
    id: key,
    ...CATEGORIES[key]
  }));
};
