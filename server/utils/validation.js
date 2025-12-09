function sanitizeString(input) {
    if (typeof input !== 'string') {
        return input;
    }

    let sanitized = input.replace(/<[^>]*>/g, '');

    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    sanitized = sanitized.trim();

    return sanitized;
}



function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}


function isValidPassword(password) {
    if (!password || typeof password !== 'string') {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }


    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one special character' };
    }

    return { valid: true };
}


function containsSQLInjection(input) {
    if (typeof input !== 'string') {
        return false;
    }

    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
        /(;|--|\|\||&&)/,
        /(\bUNION\b.*\bSELECT\b)/i,
        /(\bOR\b.*=.*)/i
    ];


    return sqlPatterns.some(pattern => pattern.test(input));
}


function containsPathTraversal(input) {
    if (typeof input !== 'string') {
        return false;
    }

    const pathPatterns = [
        /\.\.\//,
        /\.\.\\/,
        /%2e%2e/i,
        /\.\.%2f/i,
        /%252e/i
    ];

    return pathPatterns.some(pattern => pattern.test(input));
}



function validateUserInput(data) {
    const errors = [];

    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {

            if (containsSQLInjection(value)) {
                errors.push(`${key} contains invalid characters`);
            }

            if (containsPathTraversal(value)) {
                errors.push(`${key} contains invalid path characters`);
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors
    };
}



function sanitizeObject(obj) {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeString(value);
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}


function isValidId(id) {
    const numId = parseInt(id);
    return !isNaN(numId) && numId > 0 && Number.isInteger(numId);
}


module.exports = {
    sanitizeString,
    sanitizeObject,
    isValidEmail,
    isValidPassword,
    validateUserInput,
    isValidId,
    containsSQLInjection,
    containsPathTraversal
};
