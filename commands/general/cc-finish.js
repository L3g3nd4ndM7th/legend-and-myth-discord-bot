const fs = require('fs');
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-finish')
    .setDescription('Finish your character.')
    .addStringOption(option =>
      option
        .setName('finished')
        .setDescription('Enter "yes" if you have finished character creation.')
        .setRequired(true)
        .addChoices(
          { name: 'Yes', value: 'yes' },
          { name: 'No', value: 'no' }
        )
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

    if (interaction.options.getString('finished') === 'yes') {
      const charactersPath = path.join(__dirname, '..', '..', 'database', 'characters.json');
      const charactersData = fs.readFileSync(charactersPath, 'utf8');
      const characters = JSON.parse(charactersData);

      // Check if any properties in the character are null
      for (const property in characters[userId]) {
        if (characters[userId][property] === null) {
          await interaction.reply({ content: "Please do the other commands before finishing your character.", ephemeral: true });
          return;
        }
      }

      // Set the character's HP in characters.json
      characters[userId].hp = getRandomNumber(1, 10); // Generate HP between 1 and 10

      // Set the character's name in users.json
      users[userId].character = characters[userId].name;

      fs.writeFileSync(charactersPath, JSON.stringify(characters, null, 2));
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

      // Format character data into the description
      const description = `**Name:** ${characters[userId].name}\n` +
        `**Species:** ${characters[userId].species}\n` +
        `**Archetype:** ${characters[userId].archetype}\n` +
        `**Alignment:** ${characters[userId].alignment}\n` +
        `**Strength:** ${characters[userId].strength}\n` +
        `**Dexterity:** ${characters[userId].dexterity}\n` +
        `**Constitution:** ${characters[userId].constitution}\n` +
        `**Intelligence:** ${characters[userId].intelligence}\n` +
        `**Wisdom:** ${characters[userId].wisdom}\n` +
        `**Charisma:** ${characters[userId].charisma}\n` +
        `**Money:** ${characters[userId].money}\n` +
        `**Level:** ${characters[userId].level}\n` +
        `**Experience:** ${characters[userId].experience}\n` +
        `**HP:** ${characters[userId].hp}`;

      // Create the character details embed
      const embed = new EmbedBuilder()
        .setColor(0xFFA500)
        .setTitle('Character Details')
        .setDescription(description);

      // Send the character details as an embed in the same channel where the command was used
      await interaction.reply({ embeds: [embed], ephemeral: true });
    } else {
      // If finished is "no", do nothing and say nothing
    }
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
