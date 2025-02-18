require('dotenv').config();
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const NodeCache = require("node-cache");

const app = express();
const cache = new NodeCache({ stdTTL: 40 });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

client.once('ready', () => {
  console.log('Bot is ready!');
});

app.get('/api/status', async (req, res) => {
  try {

    const cachedData = cache.get("status");
    if (cachedData) {
      return res.json({ status: 'success', data: cachedData });
    }

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) {
      return res.status(404).json({ status: 'error', message: 'Channel not found' });
    }

    const messages = await channel.messages.fetch({ limit: 1 });
    if (messages.size === 0) {
      return res.status(404).json({ status: 'error', message: 'No messages found' });
    }

    let jobId = null, playerCount = null, bossName = null;

    messages.each((message) => {
      message.embeds.forEach((embed) => {
        embed.fields.forEach((field) => {
          if (field.name === 'Job Id') jobId = field.value;
          if (field.name === 'Player Count') playerCount = field.value;
          if (field.name === 'Boss Name' && field.value === 'Dough King') {
            bossName = field.value;
          }
        });
      });
    });

    if (jobId && playerCount && bossName) {
      const responseData = { jobId, playerCount, bossName };
      cache.set("status", responseData);
      return res.json({ status: 'success', data: responseData });
    } else {
      return res.status(404).json({ status: 'error', message: 'Required data not found' });
    }
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

client.login(TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
