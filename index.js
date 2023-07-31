const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.MessageContent
] });

client.commands = new Collection();
const profanityWords = ['shit', 'fuck', 'bitch', 'ass', 'pussy', 'dick', 'cock', 'cunt', 'nigger', 'cracker', 'fag'];

const readCommands = (dir) => {
  const files = fs.readdirSync(dir);
  const commands = [];
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);
    if (stat.isDirectory()) commands.push(...readCommands(filePath));
    else if (file.endsWith('.js')) commands.push(require(filePath));
  }
  return commands;
};

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = readCommands(commandsPath);

for (const command of commandFiles) {
  if ('data' in command && 'execute' in command) client.commands.set(command.data.name, command);
  else console.error(`[WARNING] The command ${command.name} is missing a required "data" or "execute" property.`);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return;
  const { id, username } = member.user;

  const user = {
    userID: id,
    userName: username,
    character: null,
    abilityScoreRolls: 1,
    moneyRolls: 1,
    hpRolls: 1
  };

  const userDataPath = path.join(__dirname, 'database', 'users.json');
  try {
    const userData = await fs.promises.readFile(userDataPath, 'utf8');
    const users = JSON.parse(userData);
    if (!users[id]) {
      users[id] = user;
      await fs.promises.writeFile(userDataPath, JSON.stringify(users, null, 2));
    }
  } catch (error) {
    console.error('Error while reading/writing user data:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`);
    return;
  }
  await command.execute(interaction);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Fetch the bot's global commands
  const commands = await client.application.commands.fetch();

  // Check if the message content matches any of the command names
  const isCommand = commands.some((command) =>
    message.content.startsWith(`/${command.name}`)
  );

  if (message.channel.id === '1135073526362157126' && !isCommand) {
    await message.delete();
  } else if (containsProfanity(message.content)) {
    await message.delete();
    const filteredMessage = filterProfanity(message.content);
    await message.channel.send(`${message.author} said: ${filteredMessage}`);
  }
});

function containsProfanity(message) {
  const lowerCaseMessage = message.toLowerCase();
  return profanityWords.some(word => lowerCaseMessage.includes(word));
}

function filterProfanity(message) {
  for (const word of profanityWords) {
    const regex = new RegExp(word, 'gi');
    message = message.replace(regex, '-'.repeat(word.length));
  }
  return message;
}

client.login(token);