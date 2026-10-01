const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

let cache = null;
let last = 0;

async function getRealStock() {
  const APIS = [
    'https://blox-fruits-stock-api.vercel.app/api/stock',
    'https://api.torikumu.com/blox-fruits/stock',
    'https://fruityblox.com/api/stock'
  ];

  for (const url of APIS) {
    try {
      console.log(`Probando REAL: ${url}`);
      const res = await fetch(url, {
        headers: { 
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
      if (!res.ok) continue;
      const data = await res.json();
      
      // Si tiene datos validos
      if (data && (data.normal || data.mirage || data.current || Array.isArray(data))) {
        cache = data;
        last = Date.now();
        console.log(`STOCK REAL OK de ${url}`);
        console.log(JSON.stringify(data).slice(0, 300));
        return;
      }
    } catch (e) {
      console.log(`Fallo ${url}: ${e.message}`);
    }
  }
  console.log("Todas las reales fallaron, mantengo cache anterior");
}

app.get('/stock', async (req, res) => {
  if (!cache) await getRealStock();
  res.json(cache || { error: "Cargando stock real, refresca en 15s", time: new Date().toISOString() });
});

app.get('/api/stock', async (req, res) => {
  if (!cache) await getRealStock();
  res.json(cache || { error: "Cargando..." });
});

app.get('/', (req, res) => {
  res.send(`
    <h1>LIVE - Stock REAL</h1>
    <p>Ultima actualizacion: ${new Date(last).toString()}</p>
    <a href="/stock">Ver /stock REAL</a>
    <pre>${JSON.stringify(cache, null, 2).slice(0, 2000)}</pre>
  `);
});

setInterval(getRealStock, 2 * 60 * 1000);
getRealStock();

app.listen(PORT, () => console.log(`Page REAL running - Port ${PORT}`));
