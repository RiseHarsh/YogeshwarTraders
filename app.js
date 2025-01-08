const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');

const app = express(); // Initialize the app first

// Use CORS middleware after initializing app
app.use(cors());

app.use(bodyParser.json());

// Set up MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Connect to MySQL
db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to MySQL database');
});

// Define login route
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM admin WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    });
});

// Start the server after all configurations
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
