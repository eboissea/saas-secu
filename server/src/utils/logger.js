import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...meta }) => {
    // Sanitize sensitive data from logs
    const sanitizedMeta = { ...meta };
    if (sanitizedMeta.password) sanitizedMeta.password = '[REDACTED]';
    if (sanitizedMeta.token) sanitizedMeta.token = '[REDACTED]';
    if (sanitizedMeta.authorization) sanitizedMeta.authorization = '[REDACTED]';

    const metaStr = Object.keys(sanitizedMeta).length > 0
        ? ` ${JSON.stringify(sanitizedMeta)}`
        : '';

    return `${timestamp} [${level}]${message}${metaStr}`;
});

export const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: combine(
        errors({ stack: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(colorize(), logFormat),
        }),
    ],
    // Don't exit on uncaught exceptions
    exitOnError: false,
});
