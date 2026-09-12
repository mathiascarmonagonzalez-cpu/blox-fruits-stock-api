const http = require('http');
http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Bot Blox Fruits Alive');
}).listen(process.env.PORT || 10000, () => console.log("Web server ON"));

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function getStock() {
  try {
    console.log("Probando j3k.app...");
    const res = await axios.get("https://api.j3k.app/blox-fruits/stock", { timeout: 15000 });
    console.log("Respuesta API:", JSON.stringify(res.data).slice(0, 500));
    return res.data;
  } catch (e) {
    console.log("Error API j3k:", e.message);
    return null;
  }
}

function parseStock(data) {
  if (!data) return { normal: [], mirage: [] };
  // Formato j3k nuevo: { normal: [], mirage: [] } o { stock: { normal: [], mirage: [] } }
  if (data.normal && Array.isArray(data.normal)) return { normal: data.normal, mirage: data.mirage || [] };
  if (data.data && data.data.normal) return { normal: data.data.normal, mirage: data.data.mirage || [] };
  if (data.stock && data.stock.normal) return { normal: data.stock.normal, mirage: data.stock.mirage || [] };
  if (data.normalStock) return { normal: data.normalStock, mirage: data.mirageStock || [] };
  return { normal: [], mirage: [] };
}

async function sendStock() {
  try {
    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const raw = await getStock();
    const stock = parseStock(raw);

    const embed = new EmbedBuilder()
      .setTitle('🍈 Blox Fruits Stock')
      .setColor(0x00FF00)
      .setTimestamp();

    if (stock.normal.length > 0 || stock.mirage.length > 0) {
      const normalText = stock.normal.length > 0 ? stock.normal.map(f => `• **${f.name || f.Name || f}** - $${f.price || ''}`).join('\n') : 'Vacío';
      const mirageText = stock.mirage.length > 0 ? stock.mirage.map(f => `• **${f.name || f.Name || f}**`).join('\n') : 'Vacío';
      
      embed.setDescription(`**Normal:**\n${normalText}\n\n**Mirage:**\n${mirageText}`);
      embed.addFields({ name: '⏰', value: `Actualizado <t:${Math.floor(Date.now()/1000)}:R> - Cada 5 min` });
    } else {
      embed.setDescription('No pude leer el stock, pero estoy vivo. Revisa logs.');
      embed.addFields({ name: 'Raw', value: JSON.stringify(raw).slice(0, 1000) || 'null' });
    }

    await channel.send({ embeds: [embed] });
    console.log("Mensaje enviado a Discord");
  } catch (e) {
    console.log("Error enviando:", e.message);
  }
}

client.once('ready', () => {
  console.log(`BOT CONECTADO como ${client.user.tag}`);
  sendStock();
  setInterval(sendStock, 300000); // 5 min
});

client.login(process.env.DISCORD_TOKEN);
