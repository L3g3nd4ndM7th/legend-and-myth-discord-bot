const { REST } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const { clientId, token } = require('./config.json');

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    console.log('Started deleting global commands...');

    // Fetch all global commands associated with your bot's application
    const result = await rest.get(Routes.applicationCommands(clientId));

    // Delete each command individually
    for (const command of result) {
      await rest.delete(Routes.applicationCommand(clientId, command.id));
      console.log(`Deleted command with ID: ${command.id}`);
    }

    console.log('Successfully deleted global commands.');
  } catch (error) {
    console.error('Error deleting global commands:', error.message);
  }
})();