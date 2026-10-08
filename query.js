const { Client } = require('pg');
require('dotenv').config();
async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    console.log('Connection successful!');
    const res = await client.query('SELECT id, "publishStatus", status FROM "BlogPost"');
    console.log('BEFORE DATA:');
    console.table(res.rows);
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
