const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear-chat')
    .setDescription('Clears the chat log.')
    .addIntegerOption(option => option.setName('count').setDescription('Number of messages to delete').setRequired(true)),

  async execute(interaction) {
    const count = interaction.options.getInteger('count');

    // Check if the user has the required permissions to delete messages
    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: "You don't have the required permissions to use this command.", ephemeral: true });
    }

    // Check if the count is a valid number
    if (isNaN(count) || count <= 0) {
      return interaction.reply({ content: 'Please provide a valid positive number of messages to delete.', ephemeral: true });
    }

    // Delete the specified number of messages (limit to 100 at a time)
    try {
      await interaction.channel.bulkDelete(count > 100 ? 100 : count, true);
      interaction.reply({ content: `Successfully deleted ${count} messages.`, ephemeral: true });
    } catch (error) {
      console.error('Error while deleting messages:', error);
      interaction.reply({ content: 'An error occurred while deleting messages.', ephemeral: true });
    }
  },
};