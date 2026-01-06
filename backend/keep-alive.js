import https from 'https';
import dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const SITE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;
const PING_INTERVAL = 14 * 60 * 1000;

function pingServer() {
  console.log(`[${new Date().toISOString()}] Pinging ${SITE_URL}/health`);
  
  https.get(`${SITE_URL}/health`, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`[${new Date().toISOString()}] Server responded with status: ${res.statusCode} ${data}`);
    });
  }).on('error', (err) => {
    console.error(`[${new Date().toISOString()}] Error pinging server:`, err.message);
  });
}

console.log(`Starting keep-alive service for ${SITE_URL}`);
pingServer();
setInterval(pingServer, PING_INTERVAL);
