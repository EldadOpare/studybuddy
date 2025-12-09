require('dotenv').config();

const express = require('express');
const cors = require('cors');


const authRoutes = require('./routes/auth_routes');
const quizRoutes = require('./routes/quiz_routes');
const noteRoutes = require('./routes/note_routes');
const folderRoutes = require('./routes/folder_routes');
const userRoutes = require('./routes/user_routes');
const eventRoutes = require('./routes/event_routes');
const adminRoutes = require('./routes/admin_routes');
const groqRoutes = require('./routes/groq_routes');
const materialRoutes = require('./routes/material_routes');


const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});


app.get('/', (req, res) => {
    res.json({
        message: 'StudyBuddy API is running! 🚀',
        version: '1.0.3',
        status: 'healthy',
        routes: ['auth', 'quizzes', 'notes', 'folders', 'users', 'events', 'admin', 'groq', 'materials']
    });
});


app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/groq', groqRoutes);
app.use('/api/materials', materialRoutes);


app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path
    });
});


app.use((err, req, res, next) => {
    console.error('Error:', err);

    res.status(err.status || 500).json({
        error: err.message || 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});


app.listen(PORT, () => {
    console.log(`\n🎓 StudyBuddy server running on port ${PORT}`);
    console.log(`📍 http://localhost:${PORT}\n`);
});
