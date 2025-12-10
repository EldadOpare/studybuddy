const express = require('express');
const router = express.Router();

const eventController = require('../controllers/event_controller');
const { requireAuth } = require('../middleware/auth_middleware');


router.use(requireAuth);

router.post('/', eventController.createEvent);

router.get('/', eventController.getUserEvents);

router.get('/:id', eventController.getEventById);

router.put('/:id', eventController.updateEvent);

router.delete('/:id', eventController.deleteEvent);


module.exports = router;
