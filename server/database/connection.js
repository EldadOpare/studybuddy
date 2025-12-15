// I set up the PostgreSQL connection pool for the database
const { Pool } = require('pg');

// I configured the pool to connect to the database with SSL in production
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


pool.on('connect', () => {
});

pool.on('error', (err) => {
});


// I created a helper function to run database queries
async function query(text, params) {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        return result;

    } catch (error) {
        throw error;
    }
}



async function getClient() {
    const client = await pool.connect();

    const query = client.query;
    const release = client.release;

    client.release = () => {
        client.query = query;
        client.release = release;
        return release.apply(client);
    };

    return client;
}


module.exports = {
    query,
    getClient,
    pool
};
