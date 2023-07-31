const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-3')
    .setDescription('Generate money for your character.'),
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

    const money = getRandomNumber(3, 18);

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
        hp: 0
      };
    }

    characters[userId].money = money;

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('Money Generated')
      .setDescription(`You found ${money} gold coins! 💰`);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}