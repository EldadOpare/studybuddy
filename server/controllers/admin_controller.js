

const db = require('../database/connection');


async function getAdminStats(req, res) {

    try {

        const usersResult = await db.query(

            "SELECT COUNT(*) as total FROM users WHERE role = 'student'"
        );

        const notesResult = await db.query(

            'SELECT COUNT(*) as total FROM notes'
        );

        const quizzesResult = await db.query(
            'SELECT COUNT(*) as total FROM quiz_results'
        );


        const activeTodayResult = await db.query(
            `SELECT COUNT(DISTINCT user_id) as total
             FROM (
                 SELECT user_id FROM notes WHERE DATE(created_at) = CURRENT_DATE
                 UNION
                 SELECT user_id FROM quiz_results WHERE DATE(completed_at) = CURRENT_DATE
             ) as active_users`
        );

        const stats = {
           
            totalUsers: parseInt(usersResult.rows[0].total) || 0,
           
            totalNotes: parseInt(notesResult.rows[0].total) || 0,
           
            totalQuizzes: parseInt(quizzesResult.rows[0].total) || 0,
           
            activeToday: parseInt(activeTodayResult.rows[0].total) || 0
        };

        res.json({ stats });

    } 
    catch (error) {
    
        console.error('Get admin stats error:', error);
    
        res.status(500).json({ error: 'Failed to fetch admin statistics' });
    
    }
}



async function getRecentActivity(req, res) {
    
    try {
    
        const notesActivity = await db.query(
            `SELECT
                n.id,
                n.user_id,
                u.first_name || ' ' || u.last_name as user_name,
                n.title as item_title,
                n.created_at,
                'note_created' as activity_type
             FROM notes n
             JOIN users u ON n.user_id = u.id
             ORDER BY n.created_at DESC
             LIMIT 10`
        );

        const quizzesActivity = await db.query(
            `SELECT
                qr.id,
                qr.user_id,
                u.first_name || ' ' || u.last_name as user_name,
                q.title as item_title,
                qr.completed_at as created_at,
                'quiz_taken' as activity_type
             FROM quiz_results qr
             JOIN users u ON qr.user_id = u.id
             JOIN quizzes q ON qr.quiz_id = q.id
             ORDER BY qr.completed_at DESC
             LIMIT 10`
        );


        const usersActivity = await db.query(
            `SELECT
                id,
                id as user_id,
                first_name || ' ' || last_name as user_name,
                email as item_title,
                created_at,
                'user_registered' as activity_type
             FROM users
             WHERE role = 'student'
             ORDER BY created_at DESC
             LIMIT 10`
        );

        const allActivities = [
            ...notesActivity.rows,
            ...quizzesActivity.rows,
            ...usersActivity.rows
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));


        const activities = allActivities.slice(0, 20).map((activity, index) => {
            let text = '';

            if (activity.activity_type === 'note_created') {
                text = `${activity.user_name} created a new note`;
            }
            
            else if (activity.activity_type === 'quiz_taken') {
            
                text = `${activity.user_name} took a quiz`;
            
            }
             else if (activity.activity_type === 'user_registered') {
            
                text = `${activity.user_name} joined StudyBuddy`;
            }

            return {
                id: index + 1,
                text,
                time: getRelativeTime(activity.created_at),
                userId: activity.user_id,
                type: activity.activity_type
            };
        });

        res.json({ activities });

    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
}


async function getAllUsers(req, res) {
    try {
        const result = await db.query(
            `SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.created_at,
                COUNT(DISTINCT n.id) as note_count,
                COUNT(DISTINCT qr.id) as quiz_count
             FROM users u
             LEFT JOIN notes n ON u.id = n.user_id
             LEFT JOIN quiz_results qr ON u.id = qr.user_id
             WHERE u.role = 'student'
             GROUP BY u.id
             ORDER BY u.created_at DESC`
        );

        const users = result.rows.map(user => ({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            noteCount: parseInt(user.note_count) || 0,
            quizCount: parseInt(user.quiz_count) || 0,
            createdAt: user.created_at
        }));


        res.json({ users });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}


async function getUserDetails(req, res) {
    try {
        const userId = req.params.userId;

        const userResult = await db.query(
            `SELECT
                u.id,
                u.first_name,
                u.last_name,
                u.email,
                u.bio,
                u.profile_picture_url,
                u.created_at,
                u.updated_at
             FROM users u
             WHERE u.id = $1 AND u.role = 'student'`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userResult.rows[0];


        const countsResult = await db.query(
            `SELECT
                (SELECT COUNT(*) FROM notes WHERE user_id = $1) as note_count,
                (SELECT COUNT(*) FROM quiz_results WHERE user_id = $1) as quiz_count,
                (SELECT COUNT(*) FROM materials WHERE user_id = $1) as file_count`,
            [userId]
        );

        const counts = countsResult.rows[0];

        const lastActiveResult = await db.query(
            `SELECT MAX(activity_time) as last_active
             FROM (
                 SELECT MAX(created_at) as activity_time FROM notes WHERE user_id = $1
                 UNION ALL
                 SELECT MAX(completed_at) as activity_time FROM quiz_results WHERE user_id = $1
                 UNION ALL
                 SELECT updated_at as activity_time FROM users WHERE id = $1
             ) as activities`,
            [userId]
        );

        const lastActive = lastActiveResult.rows[0].last_active;


        const user = {
            id: userData.id,
            firstName: userData.first_name,
            lastName: userData.last_name,
            email: userData.email,
            profilePicture: userData.profile_picture_url,
            bio: userData.bio,
            noteCount: parseInt(counts.note_count) || 0,
            quizCount: parseInt(counts.quiz_count) || 0,
            fileCount: parseInt(counts.file_count) || 0,
            createdAt: userData.created_at,
            lastActive: lastActive
        };

        res.json({ user });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
}



async function deleteUser(req, res) {
    try {
        const userId = req.params.userId;

        const checkResult = await db.query(
            'SELECT id, role FROM users WHERE id = $1',
            [userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (checkResult.rows[0].role === 'admin') {
            return res.status(403).json({ error: 'Cannot delete admin accounts' });
        }


        await db.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({
            message: 'User deleted successfully',
            userId: parseInt(userId)
        });

    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
}


function getRelativeTime(timestamp) {
   
    const now = new Date();
   
    const past = new Date(timestamp);
   
    const diffMs = now - past;
   
    const diffMins = Math.floor(diffMs / 60000);
   
    const diffHours = Math.floor(diffMs / 3600000);
   
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    
    if (diffMins === 1) return '1 minute ago';
    
    if (diffMins < 60) return `${diffMins} minutes ago`;
    
    if (diffHours === 1) return '1 hour ago';
    
    
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    if (diffDays === 1) return '1 day ago';
    
    if (diffDays < 7) return `${diffDays} days ago`;


    return past.toLocaleDateString();
}


module.exports = {
    getAdminStats,
    getRecentActivity,
    getAllUsers,
    getUserDetails,
    deleteUser
};
