const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

let cache = null;
let last = 0;

async function getStock(){
 try{
  const r = await fetch('https://fruityblox.com/api/stock');
  const j = await r.json();
  cache = j; last = Date.now();
  console.log('OK backup');
  return j;
 }catch(e){ console.log('backup fail', e.message); return cache; }
}

app.get('/stock', async (req,res)=>{
 if(!cache) await getStock();
 res.json(cache || {error:'cargando'});
});
app.get('/', (req,res)=> res.send(`LIVE - <a href="/stock">/stock</a> - ${new Date(last).toString()}`));

setInterval(getStock, 240000);
getStock();
app.listen(PORT, ()=> console.log('Page running on backup - Port '+PORT));
