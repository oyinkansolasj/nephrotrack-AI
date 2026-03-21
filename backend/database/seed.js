// =============================================================================
// NephroTrack — Database Seed Script
// Inserts the 3 demo staff accounts with bcrypt-hashed passwords.
// Run once after schema.sql:  node database/seed.js
// =============================================================================

require('dotenv').config();           // load .env from project root
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     process.env.DB_PORT,
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const DEMO_USERS = [
  { name: 'Dr. Amara Nwosu', email: 'amara@nephrotrack.ng', password: 'demo123', role: 'clinician'       },
  { name: 'Tunde Adeyemi',   email: 'tunde@nephrotrack.ng', password: 'demo123', role: 'admin'            },
  { name: 'Ngozi Okafor',    email: 'ngozi@nephrotrack.ng', password: 'demo123', role: 'records_officer'  },
];

async function seed() {
  console.log('🌱  Seeding NephroTrack database...\n');

  try {
    for (const u of DEMO_USERS) {
      // Hash the password with bcrypt (salt rounds = 10)
      const hash = await bcrypt.hash(u.password, 10);

      // Upsert: if email already exists just update the hash + name, skip duplicate errors
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
           SET name          = EXCLUDED.name,
               password_hash = EXCLUDED.password_hash,
               role          = EXCLUDED.role
         RETURNING id, name, email, role`,
        [u.name, u.email, hash, u.role]
      );

      const created = rows[0];
      console.log(`  ✅  ${created.role.padEnd(16)} │ ${created.name.padEnd(22)} │ ${created.email}`);
    }

    console.log('\n✔  Seed complete — all 3 demo accounts are ready.');
    console.log('   Default password for all accounts: demo123\n');
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
