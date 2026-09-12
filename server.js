const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 10000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || '1416563196693794846';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const PRICES = {
'Rocket':50000,'Spin':75000,'Blade':100000,'Spring':150000,'Bomb':200000,'Smoke':250000,
'Spike':350000,'Flame':500000,'Sand':850000,'Ice':1000000,'Dark':1200000,'Diamond':1500000,
'Light':1800000,'Rubber':2000000,'Barrier':2500000,'Ghost':2800000,'Magma':3200000,'Quake':3500000,
'Buddha':5000000,'Love':7000000,'Creation':8000000,'Spider':10000000,'Sound':12000000,
'Phoenix':15000000,'Portal':18000000,'Lightning':20000000,'Pain':23000000,'Blizzard':25000000,
'Gravity':2500000,'Mammoth':2700000,'T-Rex':2700000,'Dough':2800000,'Shadow':2900000,'Venom':3000000,
'Gas':3200000,'Spirit':3400000,'Tiger':5000000,'Yeti':5000000,'Magnet':6000000,'Kitsune':8000000,
'Control':9000000,'Dragon':15000000
};

async function getStockScraping(){
 try{
  const {data} = await axios.get('https://fruityblox.com/stock',{timeout:20000,headers:{'User-Agent':'Mozilla/5.0'}});
  const $ = cheerio.load(data);
  const normal = [];
  const mirage = [];
  $('h3').each((i,el)=>{
    const name = $(el).text().trim();
    if(PRICES[name]){
      if(normal.length < 6 &&!normal.includes(name)){
        normal.push(name);
      } else if(mirage.length < 4 &&!mirage.includes(name) &&!normal.includes(name)){
        mirage.push(name);
      }
    }
  });
  console.log('Scraped:', normal, mirage);
  if(normal.length>0 || mirage.length>0) return {normal, mirage};
  return null;
 }catch(e){ console.log('Scrape error', e.message); return null; }
}

async function sendDiscord(data){
 if(!data) return;
 try{
  const ch = await client.channels.fetch(CHANNEL_ID);
  const embed = new EmbedBuilder()
.setTitle('🍈 Blox Fruits Stock - LIVE')
.setColor(0x00FF00)
.setTimestamp()
.setDescription(`**Normal:**\n${data.normal.map(n=>`• ${n} - $${(PRICES[n]||0).toLocaleString()}`).join('\n')||'Vacío'}\n\n**Mirage:**\n${data.mirage.map(n=>`• ${n} - $${(PRICES[n]||0).toLocaleString()}`).join('\n')||'Vacío'}`);
  await ch.send({embeds:[embed]});
  console.log('Enviado Discord OK');
 }catch(e){ console.log('Discord error', e.message); }
}

function startLoop(){
 setInterval(async()=>{ const s=await getStockScraping(); if(s) await sendDiscord(s); }, 4*60*60*1000 + 60000);
 (async()=>{ const s=await getStockScraping(); if(s) await sendDiscord(s); })();
}

client.once('ready',()=>{ console.log(`BOT ON ${client.user.tag}`); startLoop(); });
client.on('clientReady',()=>{ console.log(`BOT ON ${client.user.tag}`); startLoop(); });
if(DISCORD_TOKEN) client.login(DISCORD_TOKEN);

app.get('/',(req,res)=>res.send('BOT ON SCRAPER - Magnet OK'));
app.get('/test',async(req,res)=>{
 const s=await getStockScraping();
 if(s){ await sendDiscord(s); res.send('Test OK: '+JSON.stringify(s)); }
 else res.send('Scraper no encontró nada, reintenta en 2 min');
});
app.listen(PORT,()=>console.log(`Web ON ${PORT}`));
