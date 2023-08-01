const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-money')
    .setDescription('Generate money for your character.'),
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

          const money = getRandomNumber(3, 18);

          if (!charRow) {
            const insertCharQuery = `INSERT INTO characters (userId, name, species, archetype, alignment, strength, dexterity, constitution, intelligence, wisdom, charisma, money, level, experience, hp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.run(insertCharQuery, [userId, '', null, null, null, null, null, null, null, null, null, money, 1, 0, 0], (err) => {
              if (err) {
                console.error('Error inserting data into characters table:', err);
                return;
              }
            });
          } else {
            const updateMoneyQuery = `UPDATE characters SET money = ? WHERE userId = ?`;
            db.run(updateMoneyQuery, [money, userId], (err) => {
              if (err) {
                console.error('Error updating money in characters table:', err);
                return;
              }
            });
          }

          interaction.reply({ content: `You received ${money} gold coins! 💰`, ephemeral: true });
        });
      }
    });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
