const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-stats')
    .setDescription('Generate ability scores.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const usersPath = path.join(__dirname, '..', '..', 'database', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    if (users[userId].character) {
      await interaction.reply({ content: "You already have a character.", ephemeral: true });
      return;
    }

    const charactersPath = path.join(__dirname, '..', '..', 'database', 'characters.json');
    const charactersData = fs.readFileSync(charactersPath, 'utf8');
    const characters = JSON.parse(charactersData);

    if (!characters[userId]) {
      characters[userId] = {
        name: '',
        species: null,
        archetype: null,
        alignment: null,
        strength: null,
        dexterity: null,
        constitution: null,
        intelligence: null,
        wisdom: null,
        charisma: null,
        money: null,
        level: 1,
        experience: 0,
        hp: 0,
      };
    }

    const stats = [];
    for (let i = 0; i < 6; i++) {
      const rolls = [];
      for (let j = 0; j < 3; j++) {
        rolls.push(getRandomNumber(1, 6));
      }
      const sum = rolls.reduce((total, num) => total + num, 0);
      stats.push(sum);
    }

    characters[userId].strength = stats[0];
    characters[userId].constitution = stats[1];
    characters[userId].dexterity = stats[2];
    characters[userId].intelligence = stats[3];
    characters[userId].wisdom = stats[4];
    characters[userId].charisma = stats[5];

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    // Format character stats into the description
    const description = `**Strength:** ${stats[0]}\n` +
      `**Constitution:** ${stats[1]}\n` +
      `**Dexterity:** ${stats[2]}\n` +
      `**Intelligence:** ${stats[3]}\n` +
      `**Wisdom:** ${stats[4]}\n` +
      `**Charisma:** ${stats[5]}`;

    // Create the character stats embed
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Character Stats')
      .setDescription(description);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
