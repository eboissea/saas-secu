import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

// In-memory token blacklist (for logout invalidation)
const tokenBlacklist = new Set();

// Cleanup expired tokens from blacklist periodically
setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    for (const entry of tokenBlacklist) {
        try {
            const decoded = jwt.decode(entry);
            if (decoded && decoded.exp && decoded.exp < now) {
                tokenBlacklist.delete(entry);
            }
        } catch {
            tokenBlacklist.delete(entry);
        }
    }
}, 60 * 60 * 1000); // Cleanup every hour

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.length > 2048) {
        return res.status(401).json({ error: 'Access denied. Invalid token format.' });
    }

    // Check if token is blacklisted (logged out)
    if (tokenBlacklist.has(token)) {
        return res.status(401).json({ error: 'Token has been revoked.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            maxAge: '15m',
        });

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please refresh.' });
        }
        logger.warn('Invalid token attempt', { ip: req.ip });
        return res.status(401).json({ error: 'Invalid token.' });
    }
}

export function blacklistToken(token) {
    tokenBlacklist.add(token);
}

export function generateTokens(user) {
    const accessToken = jwt.sign(
        { username: user.username, role: 'admin' },
        process.env.JWT_SECRET,
        { algorithm: 'HS256', expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
        { username: user.username, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        { algorithm: 'HS256', expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
}

export function verifyRefreshToken(token) {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
    });
}
