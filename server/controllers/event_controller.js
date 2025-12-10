const db = require('../database/connection');


async function createEvent(req, res) {
    try {
        const userId = req.userId;
        const { title, color, date, startTime, endTime, repeatWeekly, repeatUntil } = req.body;

        if (!title || !date) {
            return res.status(400).json({ error: 'Title and date are required' });
        }

        const result = await db.query(
            `INSERT INTO events (user_id, title, color, event_date, start_time, end_time, repeat_weekly, repeat_until)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING *`,
            [userId, title, color || 'blue', date, startTime, endTime, repeatWeekly || false, repeatUntil]
        );

        const event = result.rows[0];


        res.status(201).json({
            message: 'Event created successfully',
            event: {
                id: event.id,
                title: event.title,
                color: event.color,
                date: event.event_date,
                startTime: event.start_time,
                endTime: event.end_time,
                repeatWeekly: event.repeat_weekly,
                repeatUntil: event.repeat_until,
                createdAt: event.created_at
            }
        });

    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
}


async function getUserEvents(req, res) {
    try {
        const userId = req.userId;

        const result = await db.query(
            `SELECT * FROM events
             WHERE user_id = $1
             ORDER BY event_date ASC, start_time ASC`,
            [userId]
        );

        const events = result.rows.map(event => ({
            id: event.id,
            title: event.title,
            color: event.color,
            date: event.event_date,
            startTime: event.start_time,
            endTime: event.end_time,
            repeatWeekly: event.repeat_weekly,
            repeatUntil: event.repeat_until,
            createdAt: event.created_at
        }));


        res.json({ events });

    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
}


async function getEventById(req, res) {
    try {
        const userId = req.userId;
        const eventId = req.params.id;

        const result = await db.query(
            'SELECT * FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const event = result.rows[0];


        res.json({
            event: {
                id: event.id,
                title: event.title,
                color: event.color,
                date: event.event_date,
                startTime: event.start_time,
                endTime: event.end_time,
                repeatWeekly: event.repeat_weekly,
                repeatUntil: event.repeat_until,
                createdAt: event.created_at
            }
        });

    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
}



async function updateEvent(req, res) {
    try {
        const userId = req.userId;
        const eventId = req.params.id;
        const { title, color, date, startTime, endTime, repeatWeekly, repeatUntil } = req.body;

        const checkResult = await db.query(
            'SELECT id FROM events WHERE id = $1 AND user_id = $2',
            [eventId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }


        const result = await db.query(
            `UPDATE events
             SET title = COALESCE($1, title),
                 color = COALESCE($2, color),
                 event_date = COALESCE($3, event_date),
                 start_time = COALESCE($4, start_time),
                 end_time = COALESCE($5, end_time),
                 repeat_weekly = COALESCE($6, repeat_weekly),
                 repeat_until = COALESCE($7, repeat_until),
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 AND user_id = $9
             RETURNING *`,
            [title, color, date, startTime, endTime, repeatWeekly, repeatUntil, eventId, userId]
        );

        const event = result.rows[0];

        res.json({
            message: 'Event updated successfully',
            event: {
                id: event.id,
                title: event.title,
                color: event.color,
                date: event.event_date,
                startTime: event.start_time,
                endTime: event.end_time,
                repeatWeekly: event.repeat_weekly,
                repeatUntil: event.repeat_until,
                updatedAt: event.updated_at
            }
        });

    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
}



async function deleteEvent(req, res) {
    try {
        const userId = req.userId;
        const eventId = req.params.id;

        const result = await db.query(
            'DELETE FROM events WHERE id = $1 AND user_id = $2 RETURNING id',
            [eventId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
}


module.exports = {
    createEvent,
    getUserEvents,
    getEventById,
    updateEvent,
    deleteEvent
};
