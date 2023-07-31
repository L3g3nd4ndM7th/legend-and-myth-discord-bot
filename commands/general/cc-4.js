const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-4')
    .setDescription('Create a character with name and finished status.')
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Enter the name of your character.')
        .setRequired(true)
    )
    .addBooleanOption(option =>
      option
        .setName('finished')
        .setDescription('Has the character creation finished?')
        .setRequired(true)
    ),
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
        hp: 0
      };
    }

    const characterName = interaction.options.getString('name');
    const isFinished = interaction.options.getBoolean('finished');

    if (isFinished) {
      characters[userId].name = characterName;
      characters[userId].hp = getRandomNumber(1, 10); // Generate HP between 1 and 10

      // Add character's name to the character property in users.json
      users[userId].character = characterName;
    }

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle('Character Information')
      .addFields(
        { name: 'Name', value: characterName },
        { name: 'Finished', value: isFinished ? 'Yes' : 'No' }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}