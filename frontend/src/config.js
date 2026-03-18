const isProduction = import.meta.env.PROD;

// In production, we assume the API is served from the same domain under /backend/api
// Or you can set VITE_API_BASE_URL in your .env file
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (isProduction 
  ? '/backend/api' 
  : 'http://localhost/pragatikurties/backend/api');

export const UPLOADS_BASE_URL = import.meta.env.VITE_UPLOADS_BASE_URL || (isProduction
  ? '/backend/uploads'
  : 'http://localhost/pragatikurties/backend/uploads');
