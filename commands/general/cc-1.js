const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-1')
    .setDescription('Create a character with random stats.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const usersPath = path.join(__dirname, '..', '..', 'database', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    if (users[userId].character) {
      await interaction.reply({ content: "You have already finished creating a character.", ephemeral: true });
      return;
    }

    const charactersPath = path.join(__dirname, '..', '..', 'database', 'characters.json');
    const charactersData = fs.readFileSync(charactersPath, 'utf8');
    const characters = JSON.parse(charactersData);

    if (!characters[userId]) {
      characters[userId] = {
        name: '',
        species: '',
        archetype: '',
        alignment: '',
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
        money: 0,
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
      stats.push(sum.toString());
    }

    characters[userId].strength = stats[0];
    characters[userId].constitution = stats[1];
    characters[userId].dexterity = stats[2];
    characters[userId].intelligence = stats[3];
    characters[userId].wisdom = stats[4];
    characters[userId].charisma = stats[5];

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Character Stats')
      .addFields(
        { name: 'Strength', value: stats[0] },
        { name: 'Constitution', value: stats[1] },
        { name: 'Dexterity', value: stats[2] },
        { name: 'Intelligence', value: stats[3] },
        { name: 'Wisdom', value: stats[4] },
        { name: 'Charisma', value: stats[5] }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}