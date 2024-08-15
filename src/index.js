const express = require('express');
const app = express();

let latestCallbackData = {};  // Variable to store the latest callback data

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
});

// Route to display the latest callback data as JSON
app.get('/callback-data', (req, res) => {
    res.status(200).json(latestCallbackData);
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
