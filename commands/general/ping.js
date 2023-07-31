const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Ping the bot'),
  async execute(interaction) {
    // Implement your ping command logic here
    await interaction.reply('Pong!');
  }
};