const db = require('../database/connection');


async function createNote(req, res) {
    try {
        const userId = req.userId;
        const { title, content, folderId } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const result = await db.query(
            `INSERT INTO notes (user_id, folder_id, title, content)
             VALUES ($1, $2, $3, $4)
             RETURNING id, title, content, folder_id, created_at, updated_at`,
            [userId, folderId || null, title, content || '']
        );

        const note = result.rows[0];


        res.status(201).json({
            message: 'Note created successfully!',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                folderId: note.folder_id,
                createdAt: note.created_at,
                updatedAt: note.updated_at
            }
        });

    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
}


async function getUserNotes(req, res) {
    try {
        const userId = req.userId;
        const folderId = req.query.folderId;

        let query;
        let params;

        if (folderId) {
            query = `SELECT
                        n.id,
                        n.title,
                        n.content,
                        n.folder_id,
                        n.created_at,
                        n.updated_at,
                        f.name as folder_name
                     FROM notes n
                     LEFT JOIN folders f ON n.folder_id = f.id
                     WHERE n.user_id = $1 AND n.folder_id = $2
                     ORDER BY n.updated_at DESC`;
            params = [userId, folderId];

        } else {
            query = `SELECT
                        n.id,
                        n.title,
                        n.content,
                        n.folder_id,
                        n.created_at,
                        n.updated_at,
                        f.name as folder_name
                     FROM notes n
                     LEFT JOIN folders f ON n.folder_id = f.id
                     WHERE n.user_id = $1
                     ORDER BY n.updated_at DESC`;
            params = [userId];
        }


        const result = await db.query(query, params);

        const notes = result.rows.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            folderId: note.folder_id,
            folderName: note.folder_name,
            createdAt: note.created_at,
            updatedAt: note.updated_at
        }));

        res.json({ notes });

    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
}



async function getNoteById(req, res) {
    try {
        const userId = req.userId;
        const noteId = req.params.id;

        const result = await db.query(
            `SELECT n.id, n.title, n.content, n.folder_id, n.created_at, n.updated_at, f.name as folder_name
             FROM notes n
             LEFT JOIN folders f ON n.folder_id = f.id
             WHERE n.id = $1 AND n.user_id = $2`,
            [noteId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }


        const note = result.rows[0];

        res.json({
            id: note.id,
            title: note.title,
            content: note.content,
            folderId: note.folder_id,
            folderName: note.folder_name,
            createdAt: note.created_at,
            updatedAt: note.updated_at
        });

    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
}


async function updateNote(req, res) {
    try {
        const userId = req.userId;
        const noteId = req.params.id;
        const { title, content, folderId } = req.body;

        const result = await db.query(
            `UPDATE notes
             SET title = COALESCE($1, title),
                 content = COALESCE($2, content),
                 folder_id = $3,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $4 AND user_id = $5
             RETURNING id, title, content, folder_id, created_at, updated_at`,
            [title, content, folderId, noteId, userId]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        const note = result.rows[0];

        res.json({
            message: 'Note updated successfully!',
            note: {
                id: note.id,
                title: note.title,
                content: note.content,
                folderId: note.folder_id,
                createdAt: note.created_at,
                updatedAt: note.updated_at
            }
        });

    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
}



async function deleteNote(req, res) {
    try {
        const userId = req.userId;
        const noteId = req.params.id;

        const result = await db.query(
            'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
            [noteId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Note not found' });
        }

        res.json({ message: 'Note deleted successfully' });

    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
}


module.exports = {
    createNote,
    getUserNotes,
    getNoteById,
    updateNote,
    deleteNote
};
