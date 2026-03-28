import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'gas_dev_secret'

/**
 * Verifies the Bearer token in Authorization header.
 * Sets req.user = { user_id, role } on success.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Token tidak ada atau tidak valid.' })
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET)
    next()
  } catch (err) {
    res.status(401).json({ error: 'INVALID_TOKEN', message: 'Token kadaluwarsa atau tidak valid.' })
  }
}

/**
 * Role-based gate. Must come after requireAuth.
 * Usage: router.get('/something', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Akses tidak diizinkan.' })
    }
    next()
  }
}
