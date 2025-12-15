


// I handle study materials like PDFs and documents that students upload

const db = require('../database/connection');


async function getUserMaterials(req, res) {
    try {

        const userId = req.user.id;

        const { folderId } = req.query;

        let query = `
            SELECT
                m.id,
                m.name,
                m.file_type,
                m.file_url,
                m.file_size,
                m.folder_id,
                m.created_at,
                f.name as folder_name,
                f.color as folder_color
            FROM materials m
            LEFT JOIN folders f ON m.folder_id = f.id
            WHERE m.user_id = $1
        `;

        const params = [userId];

        if (folderId) {
            query += ` AND m.folder_id = $2`;
            params.push(folderId);
        }

        query += ` ORDER BY m.created_at DESC`;

        const result = await db.query(query, params);


        const materials = result.rows.map(material => ({
            id: material.id,
            name: material.name,
            fileType: material.file_type,
            fileUrl: material.file_url,
            fileSize: material.file_size,
            folderId: material.folder_id,
            folderName: material.folder_name,
            folderColor: material.folder_color,
            createdAt: material.created_at
        }));

        res.json({ materials });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
}



async function getMaterialById(req, res) {
    try {
        const userId = req.user.id;
        const materialId = req.params.id;

        const result = await db.query(
            `SELECT
                m.id,
                m.name,
                m.file_type,
                m.file_url,
                m.file_size,
                m.folder_id,
                m.created_at,
                f.name as folder_name,
                f.color as folder_color
            FROM materials m
            LEFT JOIN folders f ON m.folder_id = f.id
            WHERE m.id = $1 AND m.user_id = $2`,
            [materialId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const material = result.rows[0];


        res.json({
            material: {
                id: material.id,
                name: material.name,
                fileType: material.file_type,
                fileUrl: material.file_url,
                fileSize: material.file_size,
                folderId: material.folder_id,
                folderName: material.folder_name,
                folderColor: material.folder_color,
                createdAt: material.created_at
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch material' });
    }
}


async function uploadMaterial(req, res) {
    try {
        const userId = req.user.id;
        const { name, fileType, fileUrl, fileSize, folderId } = req.body;

        if (!name || !fileUrl) {
            return res.status(400).json({ error: 'Name and file URL are required' });
        }

        const result = await db.query(
            `INSERT INTO materials (user_id, name, file_type, file_url, file_size, folder_id)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, name, file_type, file_url, file_size, folder_id, created_at`,
            [userId, name, fileType || 'pdf', fileUrl, fileSize || 0, folderId || null]
        );

        const material = result.rows[0];


        res.status(201).json({
            message: 'Material uploaded successfully',
            material: {
                id: material.id,
                name: material.name,
                fileType: material.file_type,
                fileUrl: material.file_url,
                fileSize: material.file_size,
                folderId: material.folder_id,
                createdAt: material.created_at
            }
        });

    }
     catch (error) {

        res.status(500).json({ error: 'Failed to upload material' });
    
    }
}


async function deleteMaterial(req, res) {
    
    try {
    
        const userId = req.user.id;
        
        const materialId = req.params.id;

        const checkResult = await db.query(
            'SELECT id FROM materials WHERE id = $1 AND user_id = $2',
            [materialId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }


        await db.query(
            'DELETE FROM materials WHERE id = $1',
            [materialId]
        );

        res.json({ message: 'Material deleted successfully' });

    } catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
}



async function updateMaterial(req, res) {
    
    try {
    
        const userId = req.user.id;
    
        const materialId = req.params.id;
    
        const { name, folderId } = req.body;

        
        const checkResult = await db.query(
            'SELECT id FROM materials WHERE id = $1 AND user_id = $2',
            [materialId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Material not found' });
        }

        const result = await db.query(
            `UPDATE materials
             SET name = COALESCE($1, name),
                 folder_id = COALESCE($2, folder_id)
             WHERE id = $3
             RETURNING id, name, file_type, file_url, file_size, folder_id, created_at`,
            [name, folderId, materialId]
        );

        const material = result.rows[0];


        res.json({
            message: 'Material updated successfully',
            material: {
                id: material.id,
                name: material.name,
                fileType: material.file_type,
                fileUrl: material.file_url,
                fileSize: material.file_size,
                folderId: material.folder_id,
                createdAt: material.created_at
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to update material' });
    }
}


module.exports = {
    getUserMaterials,
    getMaterialById,
    uploadMaterial,
    deleteMaterial,
    updateMaterial
};
