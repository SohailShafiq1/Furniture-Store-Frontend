import { BACKEND_URL } from '../config/api';

/**
 * Safely construct image URLs
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.png';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Construct the URL
  let backendUrl = BACKEND_URL || 'http://localhost:5001';
  
  // Ensure backend URL has proper protocol
  if (backendUrl && !backendUrl.startsWith('http://') && !backendUrl.startsWith('https://')) {
    backendUrl = 'https://' + backendUrl;
  }

  // Ensure no double slashes
  backendUrl = backendUrl.replace(/\/+$/, '');
  imagePath = imagePath.replace(/^\/+/, '');

  return `${backendUrl}/${imagePath}`;
};

/**
 * Get a fallback image for broken images
 */
export const getPlaceholderImage = () => '/placeholder.png';
