const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cc-stats')
    .setDescription('Generate ability scores.'),
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

          const stats = generateStats();

          const updateCharQuery = `UPDATE characters SET strength = ?, constitution = ?, dexterity = ?, intelligence = ?, wisdom = ?, charisma = ? WHERE userId = ?`;
          db.run(updateCharQuery, [...stats, userId], (err) => {
            if (err) {
              console.error('Error updating data in characters table:', err);
              return;
            }

            const description = `**Strength:** ${stats[0]}\n` +
              `**Constitution:** ${stats[1]}\n` +
              `**Dexterity:** ${stats[2]}\n` +
              `**Intelligence:** ${stats[3]}\n` +
              `**Wisdom:** ${stats[4]}\n` +
              `**Charisma:** ${stats[5]}`;

            interaction.reply({ content: description, ephemeral: true });
          });
        });
      }
    });
  },
};

function generateStats() {
  const stats = [];
  for (let i = 0; i < 6; i++) {
    const rolls = [];
    for (let j = 0; j < 3; j++) {
      rolls.push(getRandomNumber(1, 6));
    }
    const sum = rolls.reduce((total, num) => total + num, 0);
    stats.push(sum);
  }
  return stats;
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}