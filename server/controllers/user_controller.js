

const db = require('../database/connection');

const bcrypt = require('bcrypt');


async function updateProfile(req, res) {
    try {
        const userId = req.userId;

        const { firstName, lastName, bio, profilePicture } = req.body;

        const result = await db.query(
            `UPDATE users
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 bio = COALESCE($3, bio),
                 profile_picture_url = COALESCE($4, profile_picture_url),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING id, first_name, last_name, email, bio, profile_picture_url`,
            [firstName, lastName, bio, profilePicture, userId]
        );

        const user = result.rows[0];

        res.json({
            message: 'Profile updated successfully!',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                bio: user.bio,
                profilePicture: user.profile_picture_url
            }
        });

    }
     catch (error) {
    
        console.error('Update profile error:', error);
    
        res.status(500).json({ error: 'Failed to update profile' });
    
    }
}



async function changePassword(req, res) {
   
    try {
   
        const userId = req.userId;
   
        const { currentPassword, newPassword } = req.body;


        if (!currentPassword || !newPassword) {
        
            return res.status(400).json({
        
                error: 'Current and new password are required'
        
            });
        }


        const userResult = await db.query(
            'SELECT password_hash FROM users WHERE id = $1',
            [userId]
        );

        const user = userResult.rows[0];

        const passwordMatches = await bcrypt.compare(currentPassword, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        const saltRounds = 10;
        
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);


        await db.query(
            `UPDATE users
             SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2`,
            [newPasswordHash, userId]
        );

        res.json({ message: 'Password changed successfully!' });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
}


async function getUserStats(req, res) {
    
    try {
    
        const userId = req.userId;

        const materialsResult = await db.query(
            `SELECT
                (SELECT COUNT(*) FROM notes WHERE user_id = $1) +
                (SELECT COUNT(*) FROM materials WHERE user_id = $1) as materials_count`,
            [userId]
        );


        const quizzesResult = await db.query(
            'SELECT COUNT(*) as quizzes_taken FROM quiz_results WHERE user_id = $1',
            [userId]
        );

        const avgScoreResult = await db.query(
            `SELECT AVG((correct_answers::float / total_questions::float) * 100) as avg_score
             FROM quiz_results
             WHERE user_id = $1`,
            [userId]
        );

        const materialsCount = parseInt(materialsResult.rows[0].materials_count) || 0;
       
        const quizzesTaken = parseInt(quizzesResult.rows[0].quizzes_taken) || 0;
       
        const averageScore = parseFloat(avgScoreResult.rows[0].avg_score) || 0;


        res.json({
            stats: {
                materialsCount,
                quizzesTaken,
                averageScore: Math.round(averageScore)
            }
        });

    } 
    catch (error) {
    
        console.error('Get user stats error:', error);
    
        res.status(500).json({ error: 'Failed to fetch user stats' });
    
    }
}


module.exports = {
    updateProfile,
    changePassword,
    getUserStats
};
