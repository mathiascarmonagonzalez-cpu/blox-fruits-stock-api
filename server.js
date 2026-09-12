const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 10000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || '1416563196693794846';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const PRICES = { 'Rocket':50000,'Spin':75000,'Blade':100000,'Spring':150000,'Bomb':200000,'Smoke':250000,'Spike':350000,'Flame':500000,'Sand':850000,'Ice':1000000,'Dark':1200000,'Diamond':1500000,'Light':1800000,'Rubber':2000000,'Barrier':2500000,'Ghost':2800000,'Magma':3200000,'Quake':3500000,'Buddha':5000000,'Love':7000000,'Creation':8000000,'Spider':10000000,'Sound':12000000,'Phoenix':15000000,'Portal':18000000,'Lightning':20000000,'Pain':23000000,'Blizzard':25000000,'Gravity':30000000,'Dough':40000000,'Shadow':45000000,'Venom':50000000,'Control':60000000,'Gas':65000000,'Spirit':70000000,'Leopard':80000000,'Yeti':90000000,'Kitsune':100000000,'Dragon':150000000 };
const HEADERS = { 'User-Agent':'Mozilla/5.0','Accept':'application/json' };

async function tryFetch(url){
  try{
    const r = await axios.get(url,{headers:HEADERS,timeout:12000});
    const d = r.data.data || r.data;
    const normal = d.normal || d.normalStock || d.stock?.normal || d.stock || [];
    const mirage = d.mirage || d.mirageStock || d.stock?.mirage || [];
    if(normal.length>0 || mirage.length>0) return {normal,mirage};
    return null;
  }catch(e){ return null; }
}
async function getStock(){
  const urls = ['https://www.bloxfruitvalues.net/api/stocks','https://fruityblox.com/api/stock','https://api.bloxfruitscalc.com/api/stock'];
  for(const u of urls){ const s=await tryFetch(u); if(s) return s; }
  return null;
}
async function sendDiscord(data){
  if(!client.isReady()) return;
  // NO mandar si está vacío - anti spam
  if((!data.normal || data.normal.length===0) && (!data.mirage || data.mirage.length===0)){
    console.log('Stock vacío, no se manda a Discord para no spamear');
    return;
  }
  try{
    const ch = await client.channels.fetch(CHANNEL_ID);
    const embed = new EmbedBuilder().setTitle('🍈 Blox Fruits Stock').setColor(0x00FF00).setTimestamp()
    .setDescription(`**Normal:**\n${data.normal.map(f=>`• ${f.name||f} - $${(PRICES[f.name||f]||0).toLocaleString()}`).join('\n')||'Vacío'}\n\n**Mirage:**\n${data.mirage.map(f=>`• ${f.name||f} - $${(PRICES[f.name||f]||0).toLocaleString()}`).join('\n')||'Vacío'}`);
    await ch.send({embeds:[embed]});
    console.log('Stock enviado');
  }catch(e){ console.log('Error Discord:',e.message); }
}
function startLoop(){
  setInterval(async()=>{const s=await getStock(); if(s) await sendDiscord(s);},5*60*1000);
  (async()=>{const s=await getStock(); if(s) await sendDiscord(s); else console.log('Sin stock ahora, esperando próximo ciclo');})();
}
client.once('ready',()=>{console.log(`BOT ON como ${client.user.tag}`); startLoop();});
client.on('clientReady',()=>{console.log(`BOT ON como ${client.user.tag}`); startLoop();});
if(DISCORD_TOKEN) client.login(DISCORD_TOKEN);
app.get('/',(req,res)=>res.send('BOT ON - anti vacio activo'));
app.listen(PORT,()=>console.log(`Web server ON en ${PORT}`));
