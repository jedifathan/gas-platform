import 'dotenv/config'
import express    from 'express'
import cors       from 'cors'
import path       from 'path'
import { fileURLToPath } from 'url'

import authRouter    from './routes/auth.js'
import signupRouter  from './routes/signup.js'
import usersRouter   from './routes/users.js'
import schoolsRouter from './routes/schools.js'
import regionsRouter from './routes/regions.js'
import uploadRouter  from './routes/upload.js'

const app  = express()
const PORT = process.env.PORT || 3001
const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: '*' }))
app.use(express.json())

// Serve uploaded files as static
app.use('/uploads', express.static('/app/uploads'))

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

// Routes
app.use('/api/auth',        authRouter)
app.use('/api/auth/signup', signupRouter)
app.use('/api/users',       usersRouter)
app.use('/api/schools',     schoolsRouter)
app.use('/api/regions',     regionsRouter)
app.use('/api/upload',      uploadRouter)

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', path: req.path }))

app.listen(PORT, () => console.log(`🚀  GAS API listening on :${PORT}`))
