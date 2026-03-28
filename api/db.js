import pg from 'pg'
const { Pool } = pg

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'gas_platform',
  user:     process.env.DB_USER     || 'gas_user',
  password: process.env.DB_PASSWORD || 'gas_secret',
})

// Fail fast if DB is unreachable on startup
pool.query('SELECT 1')
  .then(() => console.log('✅  Connected to PostgreSQL'))
  .catch(err => { console.error('❌  DB connection failed:', err.message); process.exit(1) })

export default pool
