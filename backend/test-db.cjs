const { Pool } = require('pg');
const pool = new Pool({connectionString: 'postgresql://postgres@localhost:5432/instagram_clone'});
async function test() {
  try {
    const res = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $1', ['komron']);
    console.log("Success:", res.rows);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    pool.end();
  }
}
test();
