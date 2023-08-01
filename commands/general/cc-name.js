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
        db.get('SELECT * FROM characters WHERE userId = ?', [userId], (err, charRow) => {
          if (err) {
            console.error('Error querying characters table:', err);
            return;
          }

          if (!charRow) {
            const insertCharQuery = `INSERT INTO characters (userId, name, species, archetype, alignment, strength, dexterity, constitution, intelligence, wisdom, charisma, money, level, experience, hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(insertCharQuery, [userId, '', null, null, null, null, null, null, null, null, null, null, 1, 0, 0], (err) => {
              if (err) {
                console.error('Error inserting data into characters table:', err);
                return;
              }
            });
          }

          const characterName = interaction.options.getString('name');

          const updateCharNameQuery = `UPDATE characters SET name = ? WHERE userId = ?`;
          db.run(updateCharNameQuery, [characterName, userId], (err) => {
            if (err) {
              console.error('Error updating character name in characters table:', err);
              return;
            }

            interaction.reply({ content: `Character name set to "${characterName}" successfully!`, ephemeral: true });
          });
        });
      }
    });
  },
};
