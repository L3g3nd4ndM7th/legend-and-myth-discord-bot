const { SlashCommandBuilder } = require('discord.js');

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
        if (interaction.options.getString('finished') === 'yes') {
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

            db.get('SELECT * FROM characters WHERE userId = ?', [userId], (err, charRow) => {
              if (err) {
                console.error('Error querying characters table:', err);
                return;
              }

              // Check if any properties in the character are null
              for (const property in charRow) {
                if (charRow[property] === null) {
                  interaction.reply({ content: "Please do the other commands before finishing your character.", ephemeral: true });
                  return;
                }
              }

              const updateCharQuery = `UPDATE characters SET hp = ? WHERE userId = ?`;
              db.run(updateCharQuery, [getRandomNumber(1, 10), userId], (err) => {
                if (err) {
                  console.error('Error updating character HP in characters table:', err);
                  return;
                }
              });

              db.get('SELECT * FROM characters WHERE userId = ?', [userId], (err, charRow) => {
                if (err) {
                  console.error('Error querying characters table:', err);
                  return;
                }

                db.get('SELECT * FROM users WHERE userId = ?', [userId], (err, userRow) => {
                  if (err) {
                    console.error('Error querying users table:', err);
                    return;
                  }

                  // Assign the character name to the users table
                  const characterName = charRow.name;
                  const updateUserQuery = `UPDATE users SET character = ? WHERE userId = ?`;
                  db.run(updateUserQuery, [characterName, userId], (err) => {
                    if (err) {
                      console.error('Error updating character name in users table:', err);
                      return;
                    }

                    const description = `**Name:** ${characterName}\n` +
                      `**Species:** ${charRow.species}\n` +
                      `**Archetype:** ${charRow.archetype}\n` +
                      `**Alignment:** ${charRow.alignment}\n` +
                      `**Strength:** ${charRow.strength}\n` +
                      `**Dexterity:** ${charRow.dexterity}\n` +
                      `**Constitution:** ${charRow.constitution}\n` +
                      `**Intelligence:** ${charRow.intelligence}\n` +
                      `**Wisdom:** ${charRow.wisdom}\n` +
                      `**Charisma:** ${charRow.charisma}\n` +
                      `**Money:** ${charRow.money}\n` +
                      `**Level:** ${charRow.level}\n` +
                      `**Experience:** ${charRow.experience}\n` +
                      `**HP:** ${charRow.hp}`;

                    interaction.reply({ content: description, ephemeral: true });
                  });
                });
              });
            });
          });
        } else {
          // If finished is "no", do nothing and say nothing
        }
      }
    });
  },
};

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
