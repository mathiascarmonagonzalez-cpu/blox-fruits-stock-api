const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

async function getStock() {
  try {
    const { data } = await axios.get('https://fruityblox.com/stock', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    const $ = cheerio.load(data);
    const fruits = [];
    // FruityBlox ahora pone las frutas en h3 + imagenes
    $('h3').each((i, el) => {
      const name = $(el).text().trim();
      if(name && name.length < 30 && name.length > 2){
        fruits.push(name);
      }
    });
    return { rawHtml: data, fruits: [...new Set(fruits)].slice(0,20) };
  } catch(e) {
    return null;
  }
}

app.get('/', async (req,res)=>{
  const stock = await getStock();
  res.send(`
  <html>
  <head><meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{background:#0e0e12;color:#fff;font-family:sans-serif;padding:20px;text-align:center}
    .card{background:#1e1e24;padding:15px;margin:10px;border-radius:15px}
    h1{color:#8cff00} .fruit{font-size:18px;padding:6px}
  </style>
  </head>
  <body>
    <h1>🍇 Blox Fruits Stock VIVO 24/7</h1>
    <p>Actualizado: ${new Date().toLocaleString('es-CO')} - Medellín</p>
    <div class="card">
      <h2>Stock Ahora</h2>
      ${stock && stock.fruits.length ? stock.fruits.map(f=>`<div class="fruit">🍎 ${f}</div>`).join('') : 'Cargando... espera 10s y recarga'}
    </div>
    <p>Tu bot: <b>mathiascarmonagonzalez-cpu/blox-fruits-stock-api</b> funcionando ✅</p>
    <p>Fuente oficial: fruityblox.com/stock - Se actualiza cada 4h</p>
    <script>setTimeout(()=>location.reload(), 1000*60*10)</script>
  </body>
  </html>
  `);
});

app.get('/api/bloxfruits/stock', async (req,res)=>{
  const s = await getStock();
  res.json(s || { error: 'FruityBlox no respondió, intenta en 30s' });
});

app.listen(PORT, ()=>console.log('ON '+PORT));
      stock['countdown'] = countDown
      stock[name.toLowerCase()] = fruitInfo;
    });

    res.json({ stock });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bloxfruits', async (req, res) => {
  const jsonData = await fs.readFile(path.join(__dirname, 'data', 'blox.json'))
  const jsonObj = JSON.parse(jsonData)

  res.json(jsonObj)
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.listen(PORT, () => {
  console.log('Server on port', PORT);
});
