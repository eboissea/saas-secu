import Joi from 'joi';

// Validation schemas
const schemas = {
    login: Joi.object({
        username: Joi.string().alphanum().min(3).max(30).required(),
        password: Joi.string().min(4).max(128).required(),
    }),
    refresh: Joi.object({
        refreshToken: Joi.string().max(2048).required(),
    }),
};

/**
 * Validation middleware factory
 * @param {string} schemaName - Name of the schema to validate against
 */
export function validate(schemaName) {
    return (req, res, next) => {
        const schema = schemas[schemaName];
        if (!schema) {
            return res.status(500).json({ error: 'Internal validation error' });
        }

        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true, // Remove unknown fields
        });

        if (error) {
            const details = error.details.map((d) => d.message);
            return res.status(400).json({
                error: 'Validation failed',
                details,
            });
        }

        // Replace body with validated & sanitized values
        req.body = value;
        next();
    };
}
