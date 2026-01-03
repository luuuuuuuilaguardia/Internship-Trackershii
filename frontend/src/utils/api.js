const baseUrl = import.meta.env.VITE_API_URL;
const cleanUrl = baseUrl.replace(/\/api$/, '');
return `${cleanUrl}/api`;