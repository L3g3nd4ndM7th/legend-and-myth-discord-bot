const fs = require('fs');
const path = require('path');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-name')
    .setDescription('Set the name of your character.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Enter the name of your character.')
        .setRequired(true)
    ),
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

    // Create a blank character object if the user doesn't have one
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

    const characterName = interaction.options.getString('name');

    // Set the character's name in characters.json
    characters[userId].name = characterName;

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    await interaction.reply({ content: `Character name set to "${characterName}" successfully!`, ephemeral: true });
  },
};