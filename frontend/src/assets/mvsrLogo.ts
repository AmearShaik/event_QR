// MVSR Engineering College Logo — exported as base64 data URI
// Usage: import { mvsrLogoUrl } from './mvsrLogo';
// The actual logo PNG is served from the uploaded file path.
// In production (Render), this references the static file we place in public/

// Use this constant across all components for consistency
export const MVSR_LOGO_URL = '/mvsr-logo.png';

// Fallback: if the file isn't available (dev without public folder), use a reliable external URL
export const MVSR_LOGO_FALLBACK = 'https://i.imgur.com/placeholder.png';
