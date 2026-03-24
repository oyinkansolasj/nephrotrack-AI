// Central API configuration — reads from environment variables at build time
// In production, set VITE_API_URL and VITE_ML_API_URL in your hosting platform

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const ML_API_BASE = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
