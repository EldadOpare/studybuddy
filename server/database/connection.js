const { Pool } = require('pg');


const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


pool.on('connect', () => {
    console.log(' Connected to PostgreSQL database');
});

pool.on('error', (err) => {
    console.error(' Database connection error:', err);
});


async function query(text, params) {
    const start = Date.now();

    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;

        console.log('Query executed', { text, duration, rows: result.rowCount });
        return result;

    } catch (error) {
        console.error('Query error:', error);
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
