const express = require('express');
const router = express.Router();

const folderController = require('../controllers/folder_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.post('/', folderController.createFolder);
router.get('/', folderController.getUserFolders);
router.delete('/:id', folderController.deleteFolder);


module.exports = router;
