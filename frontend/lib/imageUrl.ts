// lib/imageUrl.ts
/**
 * Helper function to get the full image URL
 * Works in both development (localhost) and production
 */
export const getImageUrl = (imagePath: string): string => {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  // If the path already includes the full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If the path doesn't start with /, add it
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  return `${BACKEND_URL}${normalizedPath}`;
};