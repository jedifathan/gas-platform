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
import coursesRouter from './routes/courses.js'

const app  = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: '*' }))
app.use(express.json())
app.use('/uploads', express.static('/app/uploads'))

app.get('/api/health', (_, res) => res.json({ status: 'ok', ts: new Date().toISOString() }))

app.use('/api/auth',        authRouter)
app.use('/api/auth/signup', signupRouter)
app.use('/api/users',       usersRouter)
app.use('/api/schools',     schoolsRouter)
app.use('/api/regions',     regionsRouter)
app.use('/api/upload',      uploadRouter)
app.use('/api/courses',     coursesRouter)

app.use((req, res) => res.status(404).json({ error: 'NOT_FOUND', path: req.path }))

app.listen(PORT, () => console.log(`🚀  GAS API listening on :${PORT}`))
