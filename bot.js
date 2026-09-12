const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const API_URL = process.env.STOCK_API_URL || 'https://blox-fruits-bot-r12y.onrender.com/api/stock';

let lastMessageId = null;

async function getStock() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data;
  } catch (e) {
    console.log('Error fetching stock:', e.message);
    return null;
  }
}

function buildEmbed(stock) {
  const embed = new EmbedBuilder()
   .setTitle('🍈 Blox Fruits Stock')
   .setColor(0x00FF00)
   .setTimestamp()
   .setDescription('Stock actual actualizado cada 5 min');

  if (stock && stock.normal) {
    embed.addFields({ name: 'Normal Stock', value: stock.normal.map(f => `• ${f.name} - $${f.price}`).join('\n') || 'Vacío' });
  }
  if (stock && stock.mirage) {
    embed.addFields({ name: 'Mirage Stock', value: stock.mirage.map(f => `• ${f.name}`).join('\n') || 'Vacío' });
  }
  if (!stock) {
    embed.addFields({ name: 'Error', value: 'No se pudo obtener el stock' });
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
