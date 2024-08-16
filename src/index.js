const express = require('express');
const { Pool } = require('pg');
const app = express();

app.use(express.json()); // Middleware to parse JSON

<<<<<<< HEAD:api/index.js
// Set up PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
=======
app.use(express.json());  // Middleware to parse JSON

// Callback URL endpoint
app.all('/daraja-callback', (req, res) => {
    const callbackData = req.body;  // Get the callback data

    // Store the latest callback data
    latestCallbackData = callbackData;

    // Process the callback data (optional)
    console.log('Received Callback Data:', callbackData);

    // Send a response to Safaricom
    res.status(200).json({
        message: 'Callback received successfully'
    });
>>>>>>> parent of 60dfc74 (cleanup):src/index.js
});

// Create the payments table if it doesn't exist
const createTable = async () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            MerchantRequestID TEXT,
            CheckoutRequestID TEXT,
            ResultCode INTEGER,
            ResultDesc TEXT,
            amount REAL,
            MpesaReceiptNumber TEXT,
            TransactionDate TEXT,
            PhoneNumber TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    try {
        await pool.query(createTableQuery);
        console.log('Payments table created or already exists.');
    } catch (err) {
        console.error('Error creating table:', err.message);
    }
};

createTable();

// Callback URL endpoint
app.post('/daraja-callback', async (req, res) => {
    // Extracting the necessary data from the callback JSON
    const callbackData = req.body; // Ensure you reference the request body
    const stkCallback = callbackData.Body.stkCallback;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;
    const merchantRequestID = stkCallback.MerchantRequestID;
    const checkoutRequestID = stkCallback.CheckoutRequestID;

    // Extracting CallbackMetadata items
    const callbackItems = stkCallback.CallbackMetadata.Item;
    const amount = callbackItems.find(item => item.Name === 'Amount').Value;
    const mpesaReceiptNumber = callbackItems.find(item => item.Name === 'MpesaReceiptNumber').Value;
    const transactionDate = callbackItems.find(item => item.Name === 'TransactionDate').Value;
    const phoneNumber = callbackItems.find(item => item.Name === 'PhoneNumber').Value;

    // Insert into database
    const insertQuery = `
        INSERT INTO payments (
            MerchantRequestID, ResultCode, CheckoutRequestID, ResultDesc, amount, MpesaReceiptNumber, TransactionDate, PhoneNumber
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [merchantRequestID, resultCode, checkoutRequestID, resultDesc, amount, mpesaReceiptNumber, transactionDate, phoneNumber];

    try {
        await pool.query(insertQuery, values);
        res.status(200).json({ message: 'Callback received and processed' });
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// Endpoint to expose payments data
app.get('/', async (req, res) => {
    const selectQuery = 'SELECT * FROM payments';

    try {
        const { rows } = await pool.query(selectQuery);
        res.status(200).json(rows);
    } catch (err) {
        console.error('Database error:', err.message);
        res.status(500).json({ message: 'Database error' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
