const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const API_URLS = [
  "https://api.j3k.app/blox-fruits/stock",
  "https://blox-fruits-stock-api-umber.vercel.app/api/stock"
];

async function getStock() {
  for (const url of API_URLS) {
    try {
      console.log(`Probando ${url}`);
      const res = await axios.get(url, { timeout: 10000 });
      console.log(`OK con ${url}:`, JSON.stringify(res.data).slice(0,200));
      return res.data;
    } catch (e) {
      console.log(`Fallo ${url}: ${e.message}`);
    }
  }
  return null;
}

function normalize(data) {
  if (!data) return { normal: [], mirage: [] };
  if (data.normal) return { normal: data.normal, mirage: data.mirage || [] };
  if (data.normalStock) return { normal: data.normalStock, mirage: data.mirageStock || [] };
  if (data.data && data.data.normal) return { normal: data.data.normal, mirage: data.data.mirage || [] };
  if (Array.isArray(data)) return { normal: data, mirage: [] };
  return { normal: [], mirage: [] };
}

async function updateStock() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    const raw = await getStock();
    const stock = normalize(raw);

    const embed = new EmbedBuilder()
      .setTitle('🍈 Blox Fruits Stock')
      .setColor(0x2bff00)
      .setTimestamp()
      .setDescription(`Actualizado <t:${Math.floor(Date.now()/1000)}:R>`);

    if (stock.normal.length > 0) {
      embed.addFields({ name: '📦 Normal Stock', value: stock.normal.map(f => `**${f.name || f.Name}**`).join('\n').slice(0,1024) });
    }
    if (stock.mirage.length > 0) {
      embed.addFields({ name: '🏝️ Mirage Stock', value: stock.mirage.map(f => `**${f.name || f.Name}**`).join('\n').slice(0,1024) });
    }
    if (stock.normal.length === 0 && stock.mirage.length === 0) {
      embed.addFields({ name: 'Error', value: 'APIs caídas, reintentando...' });
    }

    await channel.send({ embeds: [embed] });
    console.log('Nuevo mensaje de stock enviado');
  } catch (e) {
    console.log('Error update:', e.message);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateStock();
  setInterval(updateStock, 300000);
});

client.login(TOKEN);
