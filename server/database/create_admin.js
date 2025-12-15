

// I created this script to set up the first admin account for the app
// It runs once to make sure there's always an admin who can manage everything

require('dotenv').config();
const bcrypt = require('bcrypt');
const { pool } = require('./connection');


const ADMIN_EMAIL = 'eldad.opare@gmail.com';
const ADMIN_PASSWORD = 'Study@Buddy2025';
const ADMIN_FIRST_NAME = 'Eldad';
const ADMIN_LAST_NAME = 'Opare';


async function createAdminAccount() {
    console.log(' Creating admin account...\n');

    try {
        // I checked if this email already exists in the database
        const existingAdmin = await pool.query(
            'SELECT id, email, role FROM users WHERE email = $1',
            [ADMIN_EMAIL]
        );

        if (existingAdmin.rows.length > 0) {
            const admin = existingAdmin.rows[0];

            if (admin.role === 'admin') {
                console.log('   Admin account already exists!');
                console.log(`   Email: ${admin.email}`);
                console.log(`   Role: ${admin.role}\n`);
                return;
            }

            // I upgraded the existing user to admin instead of creating a duplicate
            await pool.query(
                'UPDATE users SET role = $1 WHERE email = $2',
                ['admin', ADMIN_EMAIL]
            );

            console.log('   Existing user upgraded to admin!');
            console.log(`   Email: ${ADMIN_EMAIL}\n`);
            return;
        }

        // I hashed the password to keep it secure in the database
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

        // I created a brand new admin account with all the details
        const result = await pool.query(
            `INSERT INTO users (first_name, last_name, email, password_hash, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, role, created_at`,
            [ADMIN_FIRST_NAME, ADMIN_LAST_NAME, ADMIN_EMAIL, passwordHash, 'admin']
        );

        const admin = result.rows[0];

        console.log(' Admin account created successfully!\n');
        console.log('Admin Details:');
        console.log(`   ID: ${admin.id}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Created: ${admin.created_at}\n`);

        console.log('  Admin credentials are in ADMIN_CREDENTIALS.txt');
        console.log('  Keep this file secure and DO NOT commit to git!\n');

        process.exit(0);

    } catch (error) {
        console.error(' Error creating admin account:', error);
        process.exit(1);
    }
}


createAdminAccount();
