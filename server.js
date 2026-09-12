const express = require('express');
const axios = require('axios');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
const PORT = process.env.PORT || 10000;

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID || '1416563196693794846';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const PRICES = { 'Rocket': 50000, 'Spin': 75000, 'Blade': 100000, 'Spring': 150000, 'Bomb': 200000, 'Smoke': 250000, 'Spike': 350000, 'Flame': 500000, 'Sand': 850000, 'Ice': 1000000, 'Dark': 1200000, 'Diamond': 1500000, 'Light': 1800000, 'Rubber': 2000000, 'Barrier': 2500000, 'Ghost': 2800000, 'Magma': 3200000, 'Quake': 3500000, 'Buddha': 5000000, 'Love': 7000000, 'Creation': 8000000, 'Spider': 10000000, 'Sound': 12000000, 'Phoenix': 15000000, 'Portal': 18000000, 'Lightning': 20000000, 'Pain': 23000000, 'Blizzard': 25000000, 'Gravity': 30000000, 'Dough': 40000000, 'Shadow': 45000000, 'Venom': 50000000, 'Control': 60000000, 'Gas': 65000000, 'Spirit': 70000000, 'Leopard': 80000000, 'Yeti': 90000000, 'Kitsune': 100000000, 'Dragon': 150000000 };

async function getStock() {
  try {
    const res = await axios.get('https://api.bloxstocks.com/stock', { timeout: 10000 });
    return res.data;
  } catch (e) {
    console.log('Error API:', e.message);
    return null;
  }
}

async function sendDiscord(data) {
  if (!client.isReady()) return;
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return;
    const normal = data.normal || [];
    const mirage = data.mirage || [];
    const embed = new EmbedBuilder()
     .setTitle('🍈 Blox Fruits Stock')
     .setColor(0x00FF00)
     .setTimestamp()
     .setDescription(`**Normal Stock:**\n${normal.map(f => `• ${f.name} - $${(PRICES[f.name]||0).toLocaleString()}`).join('\n') || 'Vacío'}\n\n**Mirage Stock:**\n${mirage.map(f => `• ${f.name} - $${(PRICES[f.name]||0).toLocaleString()}`).join('\n') || 'Vacío'}`);
    await channel.send({ embeds: [embed] });
    console.log('Stock enviado');
  } catch (e) { console.log('Error Discord:', e.message); }
}

client.once('ready', () => {
  console.log(`BOT ON como ${client.user.tag}`);
  setInterval(async () => {
    const stock = await getStock();
    if (stock) await sendDiscord(stock);
  }, 5 * 60 * 1000);
  (async () => { const s = await getStock(); if(s) await sendDiscord(s); })();
});

if (DISCORD_TOKEN) client.login(DISCORD_TOKEN);
app.get('/', (req,res) => res.send('BOT ON'));
app.listen(PORT, () => console.log(`Web server ON en ${PORT}`));
