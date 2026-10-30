import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'medicure_super_secret_jwt_key_change_in_production_2026';

/**
 * authenticate — verifies the Bearer JWT from the Authorization header.
 * Attaches decoded payload as req.user on success.
 */
export const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token. Please log in again.' });
  }
};

/**
 * authorize — factory that returns middleware restricting access to given roles.
 * Usage: router.get('/admin-only', authenticate, authorize('Administrator'), handler)
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of: ${roles.join(', ')}.`
      });
    }
    next();
  };
};
