const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: 'postgresql://postgres@localhost:5432/instagram_clone' });

async function main() {
  const hash = await bcrypt.hash('123456', 10);

  const users = [
    { username: 'alidev', email: 'ali@test.com', full_name: 'Ali Valiyev' },
    { username: 'jasur_01', email: 'jasur@test.com', full_name: 'Jasur Karimov' },
    { username: 'madina_m', email: 'madina@test.com', full_name: 'Madina Mirzayeva' },
    { username: 'sardor_k', email: 'sardor@test.com', full_name: 'Sardor Komiljonov' },
    { username: 'nilufar', email: 'nilufar@test.com', full_name: 'Nilufar Rahimova' },
  ];

  for (const u of users) {
    try {
      await pool.query(
        'INSERT INTO users (username, email, password_hash, full_name) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING',
        [u.username, u.email, hash, u.full_name]
      );
      console.log('Added:', u.username);
    } catch (e) {
      console.log('Error:', u.username, e.message);
    }
  }

  const result = await pool.query('SELECT id, username, full_name FROM users ORDER BY id');
  console.log('All users:', JSON.stringify(result.rows, null, 2));
  pool.end();
}

main();
