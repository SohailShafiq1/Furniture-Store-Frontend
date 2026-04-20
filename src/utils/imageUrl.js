import { BACKEND_URL } from '../config/api';

const normalizePath = (value) => String(value)
  .replace(/\\/g, '/')
  .replace(/^\/+/, '')
  .replace(/^api\/+/, '');

const swapKnownImageHost = (url) => {
  if (!url) return '';
  if (url.includes('api.bellarosefurniture.com/uploads/')) {
    return url.replace('api.bellarosefurniture.com', 'www.bellarosefurniture.com');
  }
  if (url.includes('www.bellarosefurniture.com/uploads/')) {
    return url.replace('www.bellarosefurniture.com', 'api.bellarosefurniture.com');
  }
  return '';
};

/**
 * Safely construct image URLs
 * @param {string} imagePath - The image path from the database
 * @returns {string} - The complete image URL
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';

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
  imagePath = normalizePath(imagePath);

  return `${backendUrl}/${imagePath}`;
};

/**
 * Try alternate known production host for uploaded assets.
 * Returns an empty string when no alternate is available.
 */
export const getAlternateImageUrl = (src, originalPath) => {
  const swapped = swapKnownImageHost(src);
  if (swapped && swapped !== src) return swapped;

  const normalized = normalizePath(originalPath || '');
  if (!normalized) return '';

  if (normalized.startsWith('uploads/')) {
    const base = (BACKEND_URL || '').replace(/\/+$/, '');
    if (base.includes('api.bellarosefurniture.com')) {
      return `https://www.bellarosefurniture.com/${normalized}`;
    }
    if (base.includes('www.bellarosefurniture.com')) {
      return `https://api.bellarosefurniture.com/${normalized}`;
    }
  }

  return '';
};
