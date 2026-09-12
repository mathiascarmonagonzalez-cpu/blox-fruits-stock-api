const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

let lastStock = null;

async function getStock(){
  try {
    const res = await axios.get('https://fruityblox.com/api/stock', { timeout: 10000 });
    return res.data;
  } catch(e){
    console.log('Error stock', e.message);
    return lastStock;
  }
}

app.get('/', async (req,res)=>{
  const stock = await getStock();
  if(stock) lastStock = stock;
  const s = stock || lastStock;
  let html = `<h1>Blox Fruits Stock VIVO 24/7</h1><p>Actualizado: ${new Date().toLocaleString()}</p>`;
  if(s){
    html += `<pre>${JSON.stringify(s, null, 2)}</pre>`;
  } else {
    html += `<p>Cargando stock...</p>`;
  }
  html += `<script>setTimeout(()=>location.reload(), 60000)</script>`;
  res.send(html);
});

app.get('/api/bloxfruits/stock', async (req,res)=>{
  const s = await getStock();
  if(s) lastStock = s;
  res.json(s || lastStock || { error: 'FruityBlox no responde' });
});

app.get('/api/bloxfruits', async (req,res)=>{
  const s = await getStock();
  res.json({ stock: s || lastStock });
});

app.listen(PORT, ()=>console.log('ON '+PORT));
