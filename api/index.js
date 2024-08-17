require('dotenv').config();
const express = require('express');
const bodyParser = require("body-parser")

const app = express();
console.log('Postgres URL:', process.env.POSTGRES_URL);
let latestCallbackData = {};  // Variable to store the latest callback data

app.use(express.json());  // Middleware to parse JSON

// Callback URL endpoint
app.all('/', (req, res) => {
    const callbackData = req.body;  // Get the callback data

    // Store the latest callback data
    latestCallbackData = callbackData;

    // Process the callback data (optional)
    console.log('Received Callback Data:', callbackData);

    // Send a response to Safaricom
    res.status(200).json({
        message: 'Callback received successfully'
    });
});

// Route to display the latest callback data as JSON
app.get('/callback-data', (req, res) => {
    res.status(200).json(latestCallbackData);
});

const { sql } = require('@vercel/postgres');

app.get('/create-table', async (req, res) => {
    try {
        const result = await sql`
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                MerchantRequestID TEXT,
                CheckoutRequestID TEXT,
                ResultCode INTEGER,
                ResultDesc TEXT,
                Amount REAL,
                MpesaReceiptNumber TEXT,
                TransactionDate TEXT,
                PhoneNumber TEXT,
                timestamp TIMESTAMP DEFAULT NOW()
            );
        `;
        res.status(200).json({ message: 'Table created successfully', result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating table', error });
    }
});
app.use(bodyParser.json())
app.post('/add-payment', async (req, res) => {
    try {
        // Extract nested fields from the request body
        const {
            Body: {
                stkCallback: {
                    MerchantRequestID,
                    CheckoutRequestID,
                    ResultCode,
                    ResultDesc,
                    CallbackMetadata = { Item: [] } // Default to empty array if missing
                }
            }
        } = req.body;

        // Map CallbackMetadata items to a more accessible format
        const metadata = CallbackMetadata.Item.reduce((acc, { Name, Value }) => {
            acc[Name] = Value;
            return acc;
        }, {});

        // Extract values from the metadata with defaults
        const {
            Amount = null, // Default to null if not present
            MpesaReceiptNumber = null, // Default to null if not present
            TransactionDate = null, // Default to null if not present
            PhoneNumber = null // Default to null if not present
        } = metadata;

        // Insert into the database
        await sql`
            INSERT INTO payments (
                MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, Amount, MpesaReceiptNumber, TransactionDate, PhoneNumber
            ) VALUES (
                ${MerchantRequestID}, ${CheckoutRequestID}, ${ResultCode}, ${ResultDesc}, ${Amount}, ${MpesaReceiptNumber}, ${TransactionDate}, ${PhoneNumber}
            );
        `;

        res.status(200).json({ message: 'Payment added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error adding payment', error });
    }
});



app.get('/payments', async (req, res) => {
    try {
        const payments = await sql`SELECT * FROM payments;`;
        res.status(200).json({ payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving payments', error });
    }
});



// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
