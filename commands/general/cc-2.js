const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-2')
    .setDescription('Create a character with archetype, species, and alignment parameters.')
    .addStringOption(option =>
      option
        .setName('archetype')
        .setDescription('Enter the archetype of your character.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('species')
        .setDescription('Enter the species of your character.')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('alignment')
        .setDescription('Enter the alignment of your character.')
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

    const archetype = interaction.options.getString('archetype');
    const species = interaction.options.getString('species');
    const alignment = interaction.options.getString('alignment');

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

    characters[userId].archetype = archetype;
    characters[userId].species = species;
    characters[userId].alignment = alignment;

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Character Details')
      .addFields(
        { name: 'Archetype', value: archetype },
        { name: 'Species', value: species },
        { name: 'Alignment', value: alignment }
      );

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
