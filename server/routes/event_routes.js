


// I set up all the event routes so users can manage their calendar events

const express = require('express');

const router = express.Router();

const eventController = require('../controllers/event_controller');

const { requireAuth } = require('../middleware/auth_middleware');

// I required authentication for all event routes so only logged-in users can access them
router.use(requireAuth);

router.post('/', eventController.createEvent);

router.get('/', eventController.getUserEvents);

router.get('/:id', eventController.getEventById);

router.put('/:id', eventController.updateEvent);

router.delete('/:id', eventController.deleteEvent);


module.exports = router;
