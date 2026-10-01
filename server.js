const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.static('public'));
app.use(express.json());

let cachedStock = null;
let lastFetch = 0;

// 3 APIS diferentes para backup
const APIS = [
  'https://fruityblox.com/api/stock',
  'https://api.torikumu.com/blox-fruits/stock',
  'https://blox-fruits-api.onrender.com/api/stock'
];

async function fetchStockWithBackup() {
  for (let apiUrl of APIS) {
    try {
      console.log(`Intentando: ${apiUrl}`);
      const res = await fetch(apiUrl, { timeout: 8000 });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      
      // Si viene de fruityblox viene diferente, normalizamos
      if (data.normal || data.mirage) {
        cachedStock = data;
      } else if (data.stock || Array.isArray(data)) {
        cachedStock = data;
      } else {
        cachedStock = data;
      }
      
      lastFetch = Date.now();
      console.log(`Page running on backup OK - Data de: ${apiUrl}`);
      return cachedStock;
    } catch (e) {
      console.log(`Falló ${apiUrl}: ${e.message}`);
      continue;
    }
  }
  console.log("Todas las APIs fallaron, usando cache viejo");
  return cachedStock;
}

// Cargar cache viejo del archivo si existe
try {
  const dataPath = path.join(__dirname, 'data', 'stock.json');
  if (fs.existsSync(dataPath)) {
    cachedStock = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }
} catch(e) {}

// Ruta principal que usa tu bot
app.get('/stock', async (req, res) => {
  if (!cachedStock || Date.now() - lastFetch > 5 * 60 * 1000) {
    await fetchStockWithBackup();
  }
  res.json(cachedStock || { error: "No stock yet, wait 1 min" });
});

app.get('/api/stock', async (req, res) => {
  if (!cachedStock || Date.now() - lastFetch > 5 * 60 * 1000) {
    await fetchStockWithBackup();
  }
  res.json(cachedStock || { error: "No stock yet, wait 1 min" });
});

app.get('/', (req, res) => {
  res.send(`API Live - Last fetch: ${new Date(lastFetch).toLocaleString()} <br><a href="/stock">Ver /stock</a>`);
});

// Actualizar cada 4 minutos
setInterval(fetchStockWithBackup, 4 * 60 * 1000);
fetchStockWithBackup(); // primera carga

app.listen(PORT, () => {
  console.log(`Page running on backup - Port ${PORT}`);
  console.log(`Available at your primary URL https://blox-fruits-stock-api-waea.onrender.com`);
});
