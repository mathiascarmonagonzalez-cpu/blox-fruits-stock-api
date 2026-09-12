const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_URL = process.env.STOCK_API_URL;

let lastMessageId = null;

async function getStock() {
  try {
    console.log(`Fetching ${API_URL}`);
    const res = await fetch(API_URL);
    const data = await res.json();
    console.log("API OK:", JSON.stringify(data).slice(0,300));
    return data;
  } catch (e) {
    console.log('Error fetching stock:', e.message);
    return null;
  }
}

function normalizeStock(data) {
  if (!data) return { normal: [], mirage: [] };
  
  // Formato 1: { normal: [], mirage: [] }
  if (data.normal) return { normal: data.normal, mirage: data.mirage || [] };
  
  // Formato 2: { normalStock: [], mirageStock: [] } (j3k)
  if (data.normalStock) return { normal: data.normalStock, mirage: data.mirageStock || data.mirage || [] };
  
  // Formato 3: { stock: { normal, mirage } }
  if (data.stock) return normalizeStock(data.stock);

  // Formato 4: array directo
  if (Array.isArray(data)) return { normal: data, mirage: [] };

  return { normal: [], mirage: [] };
}

function buildEmbed(rawStock) {
  const stock = normalizeStock(rawStock);
  
  const embed = new EmbedBuilder()
    .setTitle('🍈 Blox Fruits Stock')
    .setColor(0x00FF00)
    .setTimestamp()
    .setDescription('Stock actual actualizado cada 5 min');

  if (stock.normal && stock.normal.length > 0) {
    const normalText = stock.normal.map(f => {
      const name = f.name || f.Name || 'Unknown';
      const price = f.price || f.cost || f.Beli || '';
      return `**${name}**${price ? ` - ${price}` : ''}`;
    }).join('\n');
    embed.addFields({ name: 'Normal Stock', value: normalText.slice(0, 1000) || 'Vacío' });
  }

  if (stock.mirage && stock.mirage.length > 0) {
    const mirageText = stock.mirage.map(f => {
      const name = f.name || f.Name || 'Unknown';
      return `**${name}**`;
    }).join('\n');
    embed.addFields({ name: 'Mirage Stock', value: mirageText.slice(0, 1000) });
  }

  if ((!stock.normal || stock.normal.length === 0) && (!stock.mirage || stock.mirage.length === 0)) {
    embed.addFields({ name: 'Error', value: 'No se pudo obtener el stock - revisa API_URL' });
  }

  return embed;
}

async function updateStock() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log('Canal no encontrado');

    const stock = await getStock();
    const embed = buildEmbed(stock);

    if (lastMessageId) {
      try {
        const msg = await channel.messages.fetch(lastMessageId);
        await msg.edit({ embeds: [embed] });
        console.log('Stock actualizado');
        return;
      } catch {}
    }

    const newMsg = await channel.send({ embeds: [embed] });
    lastMessageId = newMsg.id;
    console.log('Nuevo mensaje de stock enviado');
  } catch (e) {
    console.log('Error update:', e.message);
  }
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  updateStock();
  setInterval(updateStock, 5 * 60 * 1000);
});

client.login(TOKEN);
