import 'dotenv/config'
import express   from 'express'
import cors      from 'cors'

import authRouter    from './routes/auth.js'
import signupRouter  from './routes/signup.js'
import usersRouter   from './routes/users.js'
import schoolsRouter from './routes/schools.js'
import regionsRouter from './routes/regions.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*' }))
app.use(express.json())

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',    authRouter)
app.use('/api/auth/signup', signupRouter)
app.use('/api/users',   usersRouter)
app.use('/api/schools', schoolsRouter)
app.use('/api/regions', regionsRouter)

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', path: req.path }))

app.listen(PORT, () => console.log(`🚀  GAS API listening on :${PORT}`))
