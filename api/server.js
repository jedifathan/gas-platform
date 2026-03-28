import 'dotenv/config'
import express from 'express'
import cors    from 'cors'

import authRouter  from './routes/auth.js'
import usersRouter from './routes/users.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*' }))   // tighten this in production
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',  authRouter)
app.use('/api/users', usersRouter)

// ── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', path: req.path }))

app.listen(PORT, () => console.log(`🚀  GAS API listening on :${PORT}`))
