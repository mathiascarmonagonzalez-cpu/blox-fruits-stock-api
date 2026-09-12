require('./bot.js');const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
let cache = { normal: [], mirage: [], updated: new Date() };
async function fetchStock(){
  const urls = ['https://api.blox-fruits.com/v1/stock','https://fruityblox.com/api/stock'];
  for(let url of urls){
    try{
      const {data} = await axios.get(url,{timeout:5000});
      if(data){
        cache.normal = data.normal || data.stock || [];
        cache.mirage = data.mirage || [];
        cache.updated = new Date();
        return cache;
      }
    }catch(e){}
  }
}
fetchStock();
setInterval(fetchStock, 1000*60*5);
app.get('/', (req,res)=>res.send('API + BOT Online'));
app.get('/stock', (req,res)=>res.json(cache));
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
client.once('ready', async ()=>{
  console.log(`Bot ${client.user.tag} online`);
  const cmds = [new SlashCommandBuilder().setName('stock').setDescription('Ver stock Blox Fruits').toJSON()];
  const rest = new REST({version:'10'}).setToken(process.env.TOKEN);
  await rest.put(Routes.applicationCommands(client.user.id), {body:cmds});
});
client.on('interactionCreate', async i=>{
  if(!i.isChatInputCommand()) return;
  if(i.commandName==='stock'){
    await i.deferReply();
    await fetchStock();
    let normal = cache.normal.length? cache.normal.map(f=>`🍎 **${f.name||f.Name}**`).join('\n'):'Vacio';
    let mirage = cache.mirage.length? cache.mirage.map(f=>`✨ **${f.name||f.Name}**`).join('\n'):'Vacio';
    const embed = new EmbedBuilder().setTitle('🍈 Blox Fruits Stock').setDescription(`**NORMAL:**\n${normal}\n\n**MIRAGE:**\n${mirage}`).setColor(0x2ECC71);
    await i.editReply({embeds:[embed]});
  }
});
if(process.env.TOKEN) client.login(process.env.TOKEN);
app.listen(PORT, ()=>console.log('Port '+PORT));
