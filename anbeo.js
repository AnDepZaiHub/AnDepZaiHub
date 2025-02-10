require('dotenv').config();

const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
const app = express();

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
  let jobId = null;
  let playerCount = null;
  let bossName = null;

  try {
    const channel = await client.channels.fetch(CHANNEL_ID);

    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found',
      });
    }

    const messages = await channel.messages.fetch({ limit: 5 });

    if (messages.size === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found in this channel',
      });
    }

    for (const message of messages.values()) {
      for (const embed of message.embeds) {
        for (const field of embed.fields) {
          if (field.name === 'Job Id') jobId = field.value;
          if (field.name === 'Player Count') playerCount = field.value;
          if (field.name === 'Boss Name' && field.value === 'Dough King') {
            bossName = field.value;
          }
        }
      }

      if (jobId && playerCount && bossName) {
        return res.json({
          status: 'success',
          data: { jobId, playerCount, bossName },
        });
      }
    }

    return res.status(404).json({
      status: 'error',
      message: 'No relevant data found',
    });

  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

client.login(TOKEN);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
