

const db = require('../database/connection');


async function createFolder(req, res) {

    try {

        const userId = req.userId;

        const { name, color } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        const result = await db.query(
            `INSERT INTO folders (user_id, name, color)
             VALUES ($1, $2, $3)
             RETURNING id, name, color, created_at`,
            [userId, name, color || 'blue']
        );

        const folder = result.rows[0];


        res.status(201).json({
            message: 'Folder created successfully!',
            folder: {
                id: folder.id,
                name: folder.name,
                color: folder.color,
                createdAt: folder.created_at
            }
        });

    } catch (error) {
        console.error('Create folder error:', error);
        res.status(500).json({ error: 'Failed to create folder' });
    }
}


async function getUserFolders(req, res) {
    
    try {
    
        const userId = req.userId;

        const result = await db.query(
            `SELECT
                f.id,
                f.name,
                f.color,
                f.created_at,
                COUNT(DISTINCT n.id) as note_count,
                COUNT(DISTINCT q.id) as quiz_count
             FROM folders f
             LEFT JOIN notes n ON f.id = n.folder_id
             LEFT JOIN quizzes q ON f.id = q.folder_id
             WHERE f.user_id = $1
             GROUP BY f.id
             ORDER BY f.created_at DESC`,
            [userId]
        );


        const folders = result.rows.map(folder => ({
            id: folder.id,
            name: folder.name,
            color: folder.color,
            noteCount: parseInt(folder.note_count),
            quizCount: parseInt(folder.quiz_count),
            createdAt: folder.created_at
        }));

        res.json({ folders });

    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
}



async function deleteFolder(req, res) {
    try {
        const userId = req.userId;
        const folderId = req.params.id;

        const result = await db.query(
            'DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id',
            [folderId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        res.json({ message: 'Folder deleted successfully' });

    } catch (error) {
        console.error('Delete folder error:', error);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
}


module.exports = {
    createFolder,
    getUserFolders,
    deleteFolder
};
