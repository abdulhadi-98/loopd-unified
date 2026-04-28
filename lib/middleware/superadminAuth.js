const jwt = require('jsonwebtoken');

function superadminAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    if (payload.role !== 'superadmin') {
      return res.status(403).json({ error: 'Superadmin access required' });
    }
    req.superadmin = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = superadminAuth;
