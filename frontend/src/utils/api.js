// const baseUrl = import.meta.env.VITE_API_URL;
// const cleanUrl = baseUrl.replace(/\/api$/, '');
// return `${cleanUrl}/api`;

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const cleanUrl = baseUrl.replace(/\/api$/, '');
export const API_URL = `${cleanUrl}/api`;