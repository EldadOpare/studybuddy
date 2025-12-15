


// I set up material routes for managing study materials like PDFs and documents

const express = require('express');

const router = express.Router();

const materialController = require('../controllers/material_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I required authentication for all material routes
router.use(requireAuth);

router.get('/', materialController.getUserMaterials);

router.get('/:id', materialController.getMaterialById);

router.delete('/:id', materialController.deleteMaterial);


module.exports = router;
