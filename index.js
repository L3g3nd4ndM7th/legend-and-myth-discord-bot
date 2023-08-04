const { Client, Collection, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require('discord.js');
const sqlite3 = require('sqlite3');

const token = '';
const clientId = '';
const guildId = '';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const db = new sqlite3.Database('database/world.db');

const profanityWords = ['badword1', 'badword2', 'badword3'];

function containsProfanity(message) {
  const lowerCaseMessage = message.toLowerCase();
  return profanityWords.some(word => lowerCaseMessage.includes(word));
}

function filterProfanity(message) {
  let filteredMessage = message;
  for (const word of profanityWords) {
    const regex = new RegExp(word, 'gi');
    filteredMessage = filteredMessage.replace(regex, '-'.repeat(word.length));
  }
  return filteredMessage;
}

const createCharacterCommand = {
  command: new SlashCommandBuilder()
    .setName('create-character')
    .setDescription('Create a new character with random stats, money, and HP.')
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
        .setName('alignment')
        .setDescription('Choose the alignment of your character.')
        .setRequired(true)
        .addChoices(
          { name: 'Lawful', value: 'Lawful' },
          { name: 'Neutral', value: 'Neutral' },
          { name: 'Chaotic', value: 'Chaotic' }
        )
    )
    .addStringOption(option =>
      option
        .setName('race')
        .setDescription('Choose the race of your character.')
        .setRequired(true)
        .addChoices(
          { name: 'Human', value: 'Human' },
          { name: 'Elf', value: 'Elf' },
          { name: 'Dwarf', value: 'Dwarf' }
        )
    )
    .addStringOption(option =>
      option
        .setName('name')
        .setDescription('Enter the name of your character.')
        .setRequired(true)
    )
    .toJSON(),

  function: async function createCharacter(interaction) {
    function generateStats() {
      const stats = [];
      for (let i = 0; i < 6; i++) {
        const rolls = Array.from({ length: 3 }, () => getRandomNumber(1, 6));
        const sum = rolls.reduce((total, num) => total + num, 0);
        stats.push(sum);
      }
      return stats;
    }

    function getRandomNumber(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    const userId = interaction.user.id;
    const archetype = interaction.options.getString('archetype');
    const alignment = interaction.options.getString('alignment');
    const race = interaction.options.getString('race');
    const name = interaction.options.getString('name');

    const checkUserQuery = `SELECT character FROM users WHERE userId = ?`;
    db.get(checkUserQuery, [userId], (err, row) => {
      if (err) {
        console.error('Error checking user data:', err);
        interaction.reply({ content: 'An error occurred while creating the character.', ephemeral: true });
        return;
      }

      if (row && row.character !== null) {
        interaction.reply({ content: 'You already have a character.', ephemeral: true });
        return;
      }

      const stats = generateStats();
      const money = getRandomNumber(3, 18);
      const hp = getRandomNumber(1, 10);
      const room = 'tavern';

      const insertCharQuery = `INSERT INTO characters (userId, name, species, archetype, alignment, strength, constitution, dexterity, intelligence, wisdom, charisma, money, level, experience, hp, room) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      db.run(insertCharQuery, [userId, name, race, archetype, alignment, ...stats, money, 1, 0, hp, room], (err) => {
        if (err) {
          console.error('Error inserting data into characters table:', err);
          interaction.reply({ content: 'An error occurred while creating the character.', ephemeral: true });
          return;
        }

        const updateUserQuery = `UPDATE users SET character = ? WHERE userId = ?`;
        db.run(updateUserQuery, [name, userId], (err) => {
          if (err) {
            console.error('Error updating character name in users table:', err);
            interaction.reply({ content: 'An error occurred while creating the character.', ephemeral: true });
            return;
          }

          const description = `**Name:** ${name}\n` +
            `**Species:** ${race}\n` +
            `**Archetype:** ${archetype}\n` +
            `**Alignment:** ${alignment}\n` +
            `**Strength:** ${stats[0]}\n` +
            `**Constitution:** ${stats[2]}\n` +
            `**Dexterity:** ${stats[1]}\n` +
            `**Intelligence:** ${stats[3]}\n` +
            `**Wisdom:** ${stats[4]}\n` +
            `**Charisma:** ${stats[5]}\n` +
            `**Money:** ${money}\n` +
            `**Level:** 1\n` +
            `**Experience:** 0\n` +
            `**HP:** ${hp}`;

          interaction.reply({ content: description, ephemeral: true });
        });
      });
    });
  }
};

const lookCommand = {
  command: new SlashCommandBuilder()
    .setName('look')
    .setDescription('Get information about the current room.')
    .toJSON(),

  function: async function look(interaction) {
    const userId = interaction.user.id;
    const getUserCharacterQuery = `SELECT room FROM characters WHERE userId = ?`;
    db.get(getUserCharacterQuery, [userId], (err, row) => {
      if (err) {
        console.error('Error retrieving character data:', err);
        interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
        return;
      }

      if (!row || !row.room) {
        interaction.reply({ content: 'You do not have a character.', ephemeral: true });
        return;
      }

      const currentRoomId = row.room;
      const getRoomNameQuery = `SELECT name FROM rooms WHERE id = ?`;
      db.get(getRoomNameQuery, [currentRoomId], (err, roomRow) => {
        if (err) {
          console.error('Error retrieving room data:', err);
          interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
          return;
        }

        if (!roomRow || !roomRow.name) {
          console.error('Room name not found for the current room:', currentRoomId);
          interaction.reply({ content: 'An error occurred while processing your command.', ephemeral: true });
          return;
        }

        const currentRoomName = roomRow.name;
        interaction.reply({ content: `You are at ${currentRoomName}.`, ephemeral: true });
      });
    });
  }
};

const clearChatCommand = {
  command: new SlashCommandBuilder()
    .setName('clear-chat')
    .setDescription('Clears the chat log.')
    .addIntegerOption(option => option.setName('count').setDescription('Number of messages to delete').setRequired(true))
    .toJSON(),

  function: async function clearChat(interaction) {
    const count = interaction.options.getInteger('count');

    if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
      return interaction.reply({ content: "You don't have the required permissions to use this command.", ephemeral: true });
    }

    if (isNaN(count) || count <= 0) {
      return interaction.reply({ content: 'Please provide a valid positive number of messages to delete.', ephemeral: true });
    }

    try {
      await interaction.channel.bulkDelete(count > 100 ? 100 : count, true);
      interaction.reply({ content: `Successfully deleted ${count} messages.`, ephemeral: true });
    } catch (error) {
      console.error('Error while deleting messages:', error);
      interaction.reply({ content: 'An error occurred while deleting messages.', ephemeral: true });
    }
  }
};

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channelId = '1135015035970781207';
  client.channels.cache.get(channelId).send('Legend and Myth is online.');
});

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;

  const { id, username } = member.user;
  const user = {
    userID: id,
    userName: username,
    character: null,
  };

  const query = 'INSERT OR IGNORE INTO users (userId, userName, character) VALUES (?, ?, ?)';
  db.run(query, [user.userID, user.userName, user.character], (err) => {
    if (err) {
      console.error('Error inserting user data:', err.message);
    }
  });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  await command.function(interaction);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Fetch the bot's global commands
  const commands = await client.application.commands.fetch();

  // Check if the message content matches any of the command names
  const isCommand = commands.some((command) => message.content.startsWith(`/${command.name}`));

  // Implement functionality for checking profanity and deleting messages
  if (message.channel.id === '1135073526362157126' && !isCommand) {
    await message.delete();
  } else if (containsProfanity(message.content)) {
    await message.delete();
    const filteredMessage = filterProfanity(message.content);
    await message.channel.send(`${message.author} said: ${filteredMessage}`);
  }
});

async function deployCommands() {
  client.commands.set(clearChatCommand.command.name, clearChatCommand);
  client.commands.set(createCharacterCommand.command.name, createCharacterCommand);
  client.commands.set(lookCommand.command.name, lookCommand);

  const rest = new REST({ version: '9' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      {
        body: [createCharacterCommand.command, clearChatCommand.command, lookCommand.command],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}

deployCommands();
client.login(token);