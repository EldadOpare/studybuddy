
// I imported bcrypt to hash passwords securely
const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const db = require('../database/connection');

const { sanitizeString, isValidEmail, isValidPassword, validateUserInput } = require('../utils/validation');


async function signup(req, res) {
    try {
        let { firstName, lastName, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                error: 'Please provide all required fields'
            });
        }


        firstName = sanitizeString(firstName);
        lastName = sanitizeString(lastName);
        email = sanitizeString(email);

        if (!isValidEmail(email)) {
            return res.status(400).json({
                error: 'Please provide a valid email address'
            });
        }

        const passwordValidation = isValidPassword(password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                error: passwordValidation.message
            });
        }


        const inputValidation = validateUserInput({ firstName, lastName, email });
        if (!inputValidation.valid) {
            return res.status(400).json({
                error: 'Invalid input detected',
                details: inputValidation.errors
            });
        }

        // I checked if someone already registered with this email
        const existingUser = await db.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                error: 'Email already registered'
            });
        }

        // I hashed the password so it's stored securely in the database
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);


        const result = await db.query(
            `INSERT INTO users (first_name, last_name, email, password_hash)
             VALUES ($1, $2, $3, $4)
             RETURNING id, first_name, last_name, email, role, created_at`,
            [firstName, lastName, email, passwordHash]
        );

        const newUser = result.rows[0];

        // I created a JWT token so the user can stay logged in for 7 days
        const token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Account created successfully!',
            token,
            user: {
                id: newUser.id,
                firstName: newUser.first_name,
                lastName: newUser.last_name,
                email: newUser.email,
                role: newUser.role,
                bio: null,
                profilePicture: null
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to create account' });
    }
}



async function login(req, res) {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        email = sanitizeString(email);

        if (!isValidEmail(email)) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }


        const result = await db.query(
            `SELECT id, first_name, last_name, email, password_hash, role, bio, profile_picture_url
             FROM users
             WHERE email = $1`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const user = result.rows[0];

        // I compared the hashed password to check if it's correct
        const passwordMatches = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );


        res.json({
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                profilePicture: user.profile_picture_url
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
    }
}


async function getCurrentUser(req, res) {
    try {
        const userId = req.userId;

        const result = await db.query(
            `SELECT id, first_name, last_name, email, bio, profile_picture_url, role, created_at
             FROM users
             WHERE id = $1`,
            [userId]
        );


        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profile_picture_url,
            role: user.role,
            createdAt: user.created_at
        });

    } catch (error) {
        res.status(500).json({ error: 'Failed to get user info' });
    }
}


module.exports = {
    signup,
    login,
    getCurrentUser
};
