const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-money')
    .setDescription('Generate money for your character.'),
  async execute(interaction) {
    const userId = interaction.user.id;
    const usersPath = path.join(__dirname, '..', '..', 'database', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    if (users[userId].character) {
      await interaction.reply({ content: "You have already have a character.", ephemeral: true });
      return;
    }

    const charactersPath = path.join(__dirname, '..', '..', 'database', 'characters.json');
    const charactersData = fs.readFileSync(charactersPath, 'utf8');
    const characters = JSON.parse(charactersData);

    const money = getRandomNumber(3, 18);

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

    characters[userId].money = money;

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Money Generated')
      .setDescription(`You received ${money} gold coins! 💰`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}