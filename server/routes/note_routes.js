const express = require('express');
const router = express.Router();

const noteController = require('../controllers/note_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.post('/', noteController.createNote);

router.get('/', noteController.getUserNotes);


router.get('/:id', noteController.getNoteById);

router.put('/:id', noteController.updateNote);

router.delete('/:id', noteController.deleteNote);


module.exports = router;
