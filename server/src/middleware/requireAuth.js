export function requireAuth(req, res, next) {
  if (req.session.userId || req.session.isAdmin) return next()
  res.status(401).json({ error: 'Não autenticado.' })
}

export function requireAdmin(req, res, next) {
  if (req.session.isAdmin) return next()
  res.status(403).json({ error: 'Apenas o administrador pode fazer isso.' })
}
