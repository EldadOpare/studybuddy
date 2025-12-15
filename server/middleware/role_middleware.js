// I created middleware to check user roles and permissions
const db = require('../database/connection');


function requireAdmin(req, res, next) {
    try {
        const userId = req.userId;

        // I checked if the user has admin role before allowing access
        db.query(
            'SELECT role FROM users WHERE id = $1',
            [userId]
        )
        .then(result => {
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result.rows[0];

            if (user.role !== 'admin') {
                return res.status(403).json({
                    error: 'Access denied. Admin privileges required.'
                });
            }

            next();
        })
        .catch(error => {
            res.status(500).json({ error: 'Authorization check failed' });
        });

    } catch (error) {
        res.status(500).json({ error: 'Authorization failed' });
    }
}



async function requireOwnership(resourceType) {
    return async (req, res, next) => {
        try {
            const userId = req.userId;
            const resourceId = req.params.id;

            // I let admins access everything, but students can only access their own content
            const userResult = await db.query(
                'SELECT role FROM users WHERE id = $1',
                [userId]
            );

            if (userResult.rows.length > 0 && userResult.rows[0].role === 'admin') {
                return next();
            }

            let query;
            let params;

            switch (resourceType) {
                case 'quiz':
                    query = 'SELECT user_id FROM quizzes WHERE id = $1';
                    params = [resourceId];
                    break;

                case 'note':
                    query = 'SELECT user_id FROM notes WHERE id = $1';
                    params = [resourceId];
                    break;

                case 'folder':
                    query = 'SELECT user_id FROM folders WHERE id = $1';
                    params = [resourceId];
                    break;

                default:
                    return res.status(400).json({ error: 'Invalid resource type' });
            }

            const result = await db.query(query, params);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Resource not found' });
            }

            const resource = result.rows[0];


            if (resource.user_id !== userId) {
                return res.status(403).json({
                    error: 'Access denied. You do not own this resource.'
                });
            }

            next();

        } catch (error) {
            res.status(500).json({ error: 'Authorization check failed' });
        }
    };
}


function preventStudentAccess(req, res, next) {
    const userId = req.userId;

    db.query(
        'SELECT role FROM users WHERE id = $1',
        [userId]
    )
    .then(result => {
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        if (user.role === 'student') {
            return res.status(403).json({
                error: 'Students cannot access this resource'
            });
        }


        next();
    })
    .catch(error => {
        res.status(500).json({ error: 'Authorization failed' });
    });
}


module.exports = {
    requireAdmin,
    requireOwnership,
    preventStudentAccess
};
