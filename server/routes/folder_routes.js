


// I set up folder routes so users can organize their notes into folders

const express = require('express');

const router = express.Router();

const folderController = require('../controllers/folder_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I required authentication for all folder routes
router.use(requireAuth);

router.post('/', folderController.createFolder);
router.get('/', folderController.getUserFolders);
router.delete('/:id', folderController.deleteFolder);


module.exports = router;
