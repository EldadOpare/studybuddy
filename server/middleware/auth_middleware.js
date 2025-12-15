// I created middleware to check if the user has a valid login token
const jwt = require('jsonwebtoken');


function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: 'No authorization token provided'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                error: 'Invalid token format'
            });
        }

        // I verified the JWT token to make sure it's valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = decoded.userId;
        req.userEmail = decoded.email;

        next();

    } catch (error) {

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }


        res.status(500).json({ error: 'Authentication failed' });
    }
}


module.exports = {
    requireAuth
};
