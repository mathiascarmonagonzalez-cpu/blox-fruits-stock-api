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
    const r = await axios.get("https://api.j3k.app/blox-fruits/stock", { timeout: 15000 });
    return r.data;
  } catch (e) { console.log("Error API:", e.message); return null; }
}

async function sendStock() {
  try {
    const ch = await client.channels.fetch(process.env.CHANNEL_ID);
    const data = await getStock();
    if(!data){ await ch.send("⚠️ API caída, reintento en 5 min"); return; }
    const normal = data.normal || data.data?.normal || [];
    const mirage = data.mirage || data.data?.mirage || [];
    const embed = new EmbedBuilder()
     .setTitle("🍈 Blox Fruits Stock")
     .setColor(0x2bff00)
     .setDescription(`**Normal:**\n${normal.map(f=>`• ${f.name||f} - $${f.price||''}`).join('\n')||'Vacío'}\n\n**Mirage:**\n${mirage.map(f=>`• ${f.name||f}`).join('\n')||'Vacío'}`)
     .setTimestamp();
    await ch.send({ embeds: [embed] });
    console.log("Stock enviado");
  } catch(e){ console.log("Error:", e.message); }
}
client.once('ready', () => { console.log("BOT ON " + client.user.tag); sendStock(); setInterval(sendStock, 300000); });
client.login(process.env.DISCORD_TOKEN);
