const express = require('express');
const router = express.Router();
const materialController = require('../controllers/material_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.get('/', materialController.getUserMaterials);

router.get('/:id', materialController.getMaterialById);


router.post('/', materialController.uploadMaterial);

router.put('/:id', materialController.updateMaterial);

router.delete('/:id', materialController.deleteMaterial);


module.exports = router;
