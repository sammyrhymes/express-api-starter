const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json()); // Middleware to parse JSON

// Set up SQLite database
const db = new sqlite3.Database('./payments.db');

// Create the payments table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        MerchantRequestID TEXT,
        CheckoutRequestID TEXT,
        ResultCode REAL,
        ResultDesc TEXT,
        amount REAL,
        MpesaReceiptNumber TEXT,
        TransactionDate TEXT,
        PhoneNumber TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
});

// Callback URL endpoint
app.post('/daraja-callback', (req, res) => {
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
    db.run(
        `INSERT INTO payments (
            MerchantRequestID, ResultCode, CheckoutRequestID, ResultDesc, amount, MpesaReceiptNumber, TransactionDate, PhoneNumber
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [merchantRequestID, resultCode, checkoutRequestID, resultDesc, amount, mpesaReceiptNumber, transactionDate, phoneNumber],
        function(err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ message: 'Database error' });
            }

            res.status(200).json({ message: 'Callback received and processed' });
        }
    );
});

// Endpoint to expose payments data
app.get('/', (req, res) => {
    db.all('SELECT * FROM payments', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json(rows);
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
