const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 10000;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || '1416563196693794846';
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const BELI = {
'Rocket':50000,'Spin':75000,'Blade':100000,'Spring':150000,'Bomb':200000,'Smoke':250000,
'Spike':350000,'Flame':500000,'Sand':850000,'Ice':1000000,'Dark':1200000,'Diamond':1500000,
'Light':1800000,'Rubber':2000000,'Barrier':2500000,'Ghost':2800000,'Magma':3200000,'Quake':3500000,
'Buddha':5000000,'Love':7000000,'Creation':8000000,'Spider':10000000,'Sound':12000000,
'Phoenix':15000000,'Portal':18000000,'Lightning':20000000,'Pain':23000000,'Blizzard':25000000,
'Gravity':2500000,'Mammoth':2700000,'T-Rex':2700000,'Dough':2800000,'Shadow':2900000,'Venom':3000000,
'Gas':3200000,'Spirit':3400000,'Tiger':5000000,'Yeti':5000000,'Magnet':6000000,'Kitsune':8000000,
'Control':9000000,'Dragon':15000000,'Leopard':80000000
};
const ROBUX = {
'Rocket':50,'Spin':75,'Blade':100,'Spring':150,'Bomb':200,'Smoke':250,
'Spike':350,'Flame':550,'Sand':850,'Ice':1150,'Dark':1200,'Diamond':1200,
'Light':1700,'Rubber':1200,'Barrier':800,'Ghost':1275,'Magma':1300,'Quake':1500,
'Buddha':1650,'Love':1700,'Creation':2100,'Spider':1800,'Sound':1900,
'Phoenix':2000,'Portal':2000,'Lightning':2100,'Pain':2200,'Blizzard':2250,
'Gravity':2300,'Mammoth':2350,'T-Rex':2350,'Dough':2400,'Shadow':2425,'Venom':2450,
'Gas':2500,'Spirit':2550,'Tiger':3000,'Yeti':3000,'Magnet':3500,'Kitsune':4000,
'Control':4000,'Dragon':5000,'Leopard':5000
};
const EMOJI = {
'Rocket':'🚀','Spin':'🌀','Blade':'🗡️','Spring':'🦘','Bomb':'💣','Smoke':'💨',
'Spike':'🌵','Flame':'🔥','Sand':'🏜️','Ice':'🧊','Dark':'🌑','Diamond':'💎',
'Light':'💡','Rubber':'🎈','Barrier':'🧱','Ghost':'👻','Magma':'🌋','Quake':'🌊',
'Buddha':'🧘','Love':'❤️','Creation':'🎨','Spider':'🕷️','Sound':'🎵',
'Phoenix':'🦅','Portal':'🌀','Lightning':'⚡','Pain':'😣','Blizzard':'❄️',
'Gravity':'🌌','Mammoth':'🦣','T-Rex':'🦖','Dough':'🍩','Shadow':'👤','Venom':'🐍',
'Gas':'🟢','Spirit':'🔮','Tiger':'🐯','Yeti':'⛄','Magnet':'🧲','Kitsune':'🦊',
'Control':'🎮','Dragon':'🐉','Leopard':'🐆'
};
const IMPORTANT = ['Buddha','Magnet','Kitsune','Dragon','Control','Leopard','Yeti','Tiger','Spirit','Gas','Venom','Shadow','Dough','Mammoth','T-Rex','Gravity','Love','Spider'];

async function getStockScraping(){
 const urls = [
   'https://api.allorigins.win/raw?url=https://fruityblox.com/stock',
   'https://corsproxy.io/?https://fruityblox.com/stock'
 ];
 for(let url of urls){
  try{
   const {data} = await axios.get(url,{timeout:25000,headers:{'User-Agent':'Mozilla/5.0'}});
   const $ = cheerio.load(data);
   const all = [];
   $('h3').each((i,el)=>{
     const name = $(el).text().trim();
     if(BELI[name] &&!all.includes(name)) all.push(name);
   });
   const normal = all.slice(0,6);
   const mirage = all.slice(6,8);
   if(normal.length>0) return {normal, mirage};
  }catch(e){}
 }
 return null;
}

async function sendDiscord(data){
 try{
  const ch = await client.channels.fetch(CHANNEL_ID);

  const format = (name, stockType) => {
    const e = EMOJI[name]||'🍈';
    return `${e} ${name} ($${BELI[name].toLocaleString()} - ${ROBUX[name]} Robux) [${stockType}]`;
  };

  const importantesNormal = data.normal.filter(f=>IMPORTANT.includes(f));
  const importantesMirage = data.mirage.filter(f=>IMPORTANT.includes(f));
  const tieneImportante = importantesNormal.length + importantesMirage.length > 0;

  if(tieneImportante){
    for(let fruit of [...importantesNormal,...importantesMirage]){
      const type = data.normal.includes(fruit)? 'Normal' : 'Mirage';
      const e = EMOJI[fruit]||'🔥';
      await ch.send({content: `@everyone ${e} **${fruit} en stock** ($${BELI[fruit].toLocaleString()} - ${ROBUX[fruit]} Robux) [${type}] ${e}`});
    }
  }

  const embed = new EmbedBuilder()
.setTitle(tieneImportante? '🚨 STOCK IMPORTANTE' : '🍈 Stock Actual')
.setColor(tieneImportante? 0xFF0000 : 0x00FF00)
.setTimestamp()
.setDescription(
`__**☀️ Normal:**__\n${data.normal.map(n=>`• ${format(n,'Normal')}`).join('\n')}\n\n__**🌙 Mirage:**__\n${data.mirage.length? data.mirage.map(n=>`• ${format(n,'Mirage')}`).join('\n') : 'Vacío'}`
);

  await ch.send({embeds:[embed]});
 }catch(e){ console.log(e.message); }
}

function startLoop(){
 setInterval(async()=>{ const s=await getStockScraping(); if(s) await sendDiscord(s); }, 4*60*60*1000 + 60000);
 (async()=>{ const s=await getStockScraping(); if(s) await sendDiscord(s); })();
}
client.once('ready',()=>{ console.log(`BOT ON`); startLoop(); });
client.on('clientReady',()=>{ console.log(`BOT ON`); startLoop(); });
if(DISCORD_TOKEN) client.login(DISCORD_TOKEN);

app.get('/',(req,res)=>res.send('BOT EMOJIS ON'));
app.get('/test',async(req,res)=>{
 const s=await getStockScraping();
 if(s){ await sendDiscord(s); res.send('Test OK: '+JSON.stringify(s)); }
 else res.send('No stock');
});
app.listen(PORT,()=>console.log('Web ON'));
