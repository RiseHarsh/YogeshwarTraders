const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config();
const cors = require('cors');
const multer = require('multer');
const mega = require('megajs');

const app = express();

// Use CORS middleware
app.use(cors());
app.use(bodyParser.json());

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

// Set up MySQL connection (only for admin login)
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

// Define login route (MySQL only stores admin login details)
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

// Mega storage configuration
const megaStorage = new mega.Storage({
    email: process.env.MEGA_EMAIL,
    password: process.env.MEGA_PASSWORD,
}, err => {
    if (err) {
        console.error('Error connecting to Mega:', err);
        process.exit(1);
    }
    console.log('Connected to Mega storage');
});

// Define product upload route (No MySQL, only Mega storage)
app.post('/uploadProduct', upload.single('productImage'), async (req, res) => {
    try {
        const { title, description, price, discount } = req.body;
        const productImage = req.file;

        if (!productImage) {
            return res.status(400).json({ success: false, message: 'Product image is required' });
        }

        const fileUpload = megaStorage.upload({ name: productImage.originalname, size: productImage.size });
        fileUpload.end(productImage.buffer);

        // Wait for the file upload to complete
        fileUpload.on('complete', async file => {
            const publicUrl = file.link(); // Get the public URL of the uploaded file

            // You can save this info to a NoSQL database, or send the URL and details in the response
            res.json({
                success: true,
                message: 'Product uploaded successfully',
                productDetails: {
                    title,
                    description,
                    price,
                    discount,
                    imageUrl: publicUrl
                }
            });
        });

        fileUpload.on('error', err => {
            console.error('Error uploading file to Mega:', err);
            res.status(500).json({ success: false, message: 'Failed to upload image to Mega' });
        });

    } catch (err) {
        console.error('Error:', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
