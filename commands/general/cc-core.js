const { SlashCommandBuilder } = require('discord.js');

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
  async execute(interaction, db) {
    const userId = interaction.user.id;

    db.get('SELECT * FROM users WHERE userId = ?', [userId], (err, userRow) => {
      if (err) {
        console.error('Error querying users table:', err);
        return;
      }

      if (userRow && userRow.character !== null) {
        interaction.reply({ content: "You already have a character.", ephemeral: true });
      } else {
        const archetype = interaction.options.getString('archetype');
        const species = interaction.options.getString('species');
        const alignment = interaction.options.getString('alignment');

        db.get('SELECT * FROM characters WHERE userId = ?', [userId], (err, charRow) => {
          if (err) {
            console.error('Error querying characters table:', err);
            return;
          }

          if (!charRow) {
            const insertCharQuery = `INSERT INTO characters (userId, name, species, archetype, alignment, strength, dexterity, constitution, intelligence, wisdom, charisma, money, level, experience, hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(insertCharQuery, [userId, '', species, archetype, alignment, null, null, null, null, null, null, null, 1, 0, 0], (err) => {
              if (err) {
                console.error('Error inserting data into characters table:', err);
                return;
              }
            });
          } else {
            const updateCharQuery = `UPDATE characters SET species = ?, archetype = ?, alignment = ? WHERE userId = ?`;
            db.run(updateCharQuery, [species, archetype, alignment, userId], (err) => {
              if (err) {
                console.error('Error updating character details in characters table:', err);
                return;
              }
            });
          }

          const description = `**Archetype:** ${archetype}\n` +
            `**Species:** ${species}\n` +
            `**Alignment:** ${alignment}`;

          interaction.reply({ content: description, ephemeral: true });
        });
      }
    });
  },
};
