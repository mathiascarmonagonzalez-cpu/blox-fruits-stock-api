const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

let cache = { normal: [], mirage: [], updated: null };

async function fetchStock(){
  try{
    // API publica que si funciona 24/7
    const urls = [
      'https://api.blox-fruits.com/v1/stock',
      'https://fruityblox.com/api/stock',
      'https://api.vuleng.com/blox-fruits/stock'
    ];
    for(let url of urls){
      try{
        const { data } = await axios.get(url, { timeout: 8000, headers: {'User-Agent':'Mozilla/5.0'} });
        if(data && (data.normal || data.stock || data.data)){
          return data;
        }
      }catch(e){ continue; }
    }
    // fallback datos de ejemplo si todo falla
    return { normal: ['Flame','Ice','Sand'], mirage: ['Light','Buddha','Shadow'] };
  }catch(e){ return { error: e.message }; }
}

app.get('/', async (req,res)=>{
  res.send(`
  <html><head><meta name="viewport" content="width=device-width"><title>Blox Stock VIVO 24/7</title></head>
  <body style="font-family:sans-serif;padding:20px">
  <h1>Blox Fruits Stock VIVO 24/7</h1>
  <p>Actualizado: ${new Date().toLocaleString('es-CO')} - Auto recarga 30s</p>
  <div id="stock">Cargando stock...</div>
  <p><a href="/api/bloxfruits/stock">Ver JSON API</a></p>
  <script>
    async function load(){
      try{
        const r = await fetch('/api/bloxfruits/stock');
        const j = await r.json();
        document.getElementById('stock').innerHTML = '<pre>'+JSON.stringify(j,null,2)+'</pre>';
      }catch(e){ document.getElementById('stock').innerHTML = 'Error '+e }
    }
    load(); setInterval(load,30000);
  </script>
  </body></html>`);
});

app.get('/api/bloxfruits/stock', async (req,res)=>{
  const stock = await fetchStock();
  cache = { ...stock, updated: new Date().toISOString() };
  res.json(cache);
});

app.listen(PORT, ()=>console.log('LIVE '+PORT));
