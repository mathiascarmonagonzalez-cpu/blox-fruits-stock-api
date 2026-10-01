const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

let cache = { normal: ["Rocket","Spin","Smoke"], mirage: ["Light","Ice"], updated: new Date().toISOString(), source: "fallback-init" };
let last = Date.now();

async function getStock(){
  try{
    console.log("Intentando torikumu...");
    const r = await fetch('https://api.torikumu.com/stock', {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const j = await r.json();
    if(j && (j.normal || j.stock || j.data)){
      cache = j;
      last = Date.now();
      console.log("OK TORIKUMU");
      return;
    }
    throw new Error("formato raro");
  }catch(e){
    console.log("Torikumu fallo: "+e.message+" - intentando fruityblox");
    try{
      const r2 = await fetch('https://fruityblox.com/api/stock', {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const j2 = await r2.json();
      cache = j2;
      last = Date.now();
      console.log("OK FRUITYBLOX");
    }catch(e2){
      console.log("Ambas fallaron, mantengo cache viejo: "+e2.message);
    }
  }
}

app.get('/stock', (req,res)=> res.json(cache));
app.get('/api/stock', (req,res)=> res.json(cache));
app.get('/', (req,res)=> res.send(`LIVE - Ultima actualizacion: ${new Date(last).toString()}<br><a href="/stock">Ver /stock</a>`));

setInterval(getStock, 120000);
getStock();

app.listen(PORT, ()=> console.log('Page running - Port '+PORT));
