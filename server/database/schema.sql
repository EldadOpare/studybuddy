-- StudyBuddy Database Schema

-- This file contains all the tables for my study buddy app


-- Users table - stores student accounts
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    bio TEXT,
    profile_picture_url TEXT,

    role VARCHAR(20) DEFAULT 'student',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Folders table - for organizing notes and quizzes
CREATE TABLE IF NOT EXISTS folders (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    name VARCHAR(100) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Notes table - student notes
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    content TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Quizzes table - stores quiz metadata
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    folder_id INTEGER REFERENCES folders(id) ON DELETE SET NULL,

    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,

    
    type VARCHAR(20) DEFAULT 'prompt',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,

    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,

    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,

  
    options JSONB NOT NULL,


    correct_answer INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Quiz results table - stores completed quiz attempts
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,

    score INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,

    -- Store user's answers as JSON array
    user_answers JSONB NOT NULL,

    time_spent INTEGER,

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Study plans table - stores student study schedules
CREATE TABLE IF NOT EXISTS study_plans (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Store goals and schedule as JSON
    goals JSONB,
    schedule JSONB,

    start_date DATE,
    end_date DATE,

    status VARCHAR(20) DEFAULT 'active',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Events table - stores calendar events and activities
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',

    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,

    repeat_weekly BOOLEAN DEFAULT false,
    repeat_until DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
