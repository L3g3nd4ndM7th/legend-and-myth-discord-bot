const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-core')
    .setDescription('Create a character with archetype, species, and alignment parameters.')
    .addStringOption(option =>
      option
        .setName('archetype')
        .setDescription('Choose the archetype of your character.')
        .setRequired(true)
        .addChoices(
          { name: 'Fighter', value: 'Fighter' },
          { name: 'Rogue', value: 'Rogue' },
          { name: 'Mage', value: 'Mage' }
        )
    )
    .addStringOption(option =>
      option
        .setName('species')
        .setDescription('Choose the species of your character.')
        .setRequired(true)
        .addChoices(
          { name: 'Human', value: 'Human' },
          { name: 'Elf', value: 'Elf' },
          { name: 'Dwarf', value: 'Dwarf' }
        )
    )
    .addStringOption(option =>
      option
        .setName('alignment')
        .setDescription(`Set character's archetype, species, and alignment.`)
        .setRequired(true)
        .addChoices(
          { name: 'Lawful', value: 'Lawful' },
          { name: 'Neutral', value: 'Neutral' },
          { name: 'Chaotic', value: 'Chaotic' }
        )
    ),
  async execute(interaction) {
    const userId = interaction.user.id;
    const usersPath = path.join(__dirname, '..', '..', 'database', 'users.json');
    const usersData = fs.readFileSync(usersPath, 'utf8');
    const users = JSON.parse(usersData);

    if (users[userId].character) {
      await interaction.reply({ content: "You already have a character.", ephemeral: true });
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

    characters[userId].archetype = archetype;
    characters[userId].species = species;
    characters[userId].alignment = alignment;

    fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));

    // Format character details into the description
    const description = `**Archetype:** ${archetype}\n` +
      `**Species:** ${species}\n` +
      `**Alignment:** ${alignment}`;

    // Create the character details embed
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Character Details')
      .setDescription(description);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
