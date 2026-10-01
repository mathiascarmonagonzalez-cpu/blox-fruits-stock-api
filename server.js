const express = require('express');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 3000;

// --- CONFIG API ORIGINAL + BACKUP ---
const MAIN_STOCK_URL = "https://api.bloxstocks.com/blox-fruits/stock";

app.get('/', (req,res) => {
  res.send('Bot on backup API - ONLINE ✅');
});

app.get('/api/stock', async (req,res) => {
  try{
    const r = await fetch(MAIN_STOCK_URL);
    const data = await r.json();
    res.json({ source: 'BACKUP API', data });
  }catch(e){
    res.json({ source: 'BACKUP API', data: null, error: 'No se pudo conectar' });
  }
});

app.listen(PORT, () => console.log('Page running on backup'));

// --- DISCORD BOT ---
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const CHANNEL_ID = process.env.CHANNEL_ID;
const TOKEN = process.env.DISCORD_TOKEN || process.env.TOKEN;

client.once('ready', async () => {
  console.log(`Bot ON: ${client.user.tag} - Bot on backup API`);
  if(!CHANNEL_ID) return;
  try{
    const ch = await client.channels.fetch(CHANNEL_ID);
    ch.send('✅ **Bot reconectado - Ahora con BACKUP API**');
  }catch{}
});

if(TOKEN) client.login(TOKEN);
