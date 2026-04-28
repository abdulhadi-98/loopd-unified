const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

function staffOnly(req, res, next) {
  authMiddleware(req, res, () => {
    if (!req.user.staffId) return res.status(403).json({ error: 'Staff access required' });
    next();
  });
}

function managerOnly(req, res, next) {
  staffOnly(req, res, () => {
    if (!['manager', 'owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Manager access required' });
    }
    next();
  });
}

module.exports = { authMiddleware, staffOnly, managerOnly };
