import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { validate } from '../middleware/validate.js';
import { generateTokens, verifyRefreshToken, blacklistToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = Router();

// Strict rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again in 15 minutes.' },
    keyGenerator: (req) => req.ip,
});

// POST /api/auth/login
router.post('/login', authLimiter, validate('login'), async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check username
        if (username !== process.env.ADMIN_USERNAME) {
            // Use constant-time comparison to prevent timing attacks
            await bcrypt.compare(password, '$2a$12$invalidhashtopreventtimingattacks..');
            logger.warn('Failed login attempt', { ip: req.ip, username });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password against stored hash
        const isValid = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!isValid) {
            logger.warn('Failed login attempt', { ip: req.ip, username });
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate tokens
        const tokens = generateTokens({ username });

        logger.info('Successful login', { ip: req.ip, username });

        res.json({
            message: 'Login successful',
            ...tokens,
        });
    } catch (err) {
        logger.error('Login error:', { error: err.message });
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', validate('refresh'), async (req, res) => {
    try {
        const { refreshToken } = req.body;

        const decoded = verifyRefreshToken(refreshToken);

        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid token type' });
        }

        // Generate new token pair
        const tokens = generateTokens({ username: decoded.username });

        res.json({
            message: 'Token refreshed',
            ...tokens,
        });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        blacklistToken(token);
    }

    res.json({ message: 'Logged out successfully' });
});

export { router as authRoutes };
