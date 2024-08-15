const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./payments.db');

// Clear the database (delete all rows in the payments table)
const clearDatabase = () => {
    db.run('DELETE FROM payments', function(err) {
        if (err) {
            return console.error('Error clearing the database:', err.message);
        }
        console.log(`Cleared ${this.changes} rows from the payments table.`);
    });
};

// Insert demo data
const insertDemoData = () => {
    const demoPayments = [
        {
            MerchantRequestID: '29115-34620561-1',
            CheckoutRequestID: 'ws_CO_191220191020363925',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            amount: 1000,
            MpesaReceiptNumber: 'NLJ7RT61SV',
            TransactionDate: '20230811094512',
            PhoneNumber: '254708374149'
        },
        {
            MerchantRequestID: '29115-34620561-2',
            CheckoutRequestID: 'ws_CO_191220191020363926',
            ResultCode: 1032,
            ResultDesc: 'Request canceled by user.',
            amount: null,
            MpesaReceiptNumber: null,
            TransactionDate: null,
            PhoneNumber: '254708374150'
        },
        {
            MerchantRequestID: '29115-34620561-3',
            CheckoutRequestID: 'ws_CO_191220191020363927',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            amount: 1500,
            MpesaReceiptNumber: 'NLJ7RT61XY',
            TransactionDate: '20230811094612',
            PhoneNumber: '254708374151'
        },
        {
            MerchantRequestID: '29115-34620561-4',
            CheckoutRequestID: 'ws_CO_191220191020363928',
            ResultCode: 1032,
            ResultDesc: 'Request canceled by user.',
            amount: null,
            MpesaReceiptNumber: null,
            TransactionDate: null,
            PhoneNumber: '254708374152'
        }
    ];

    demoPayments.forEach(payment => {
        db.run(
            `INSERT INTO payments (
                MerchantRequestID, ResultCode, CheckoutRequestID, ResultDesc, amount, MpesaReceiptNumber, TransactionDate, PhoneNumber
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                payment.MerchantRequestID,
                payment.ResultCode,
                payment.CheckoutRequestID,
                payment.ResultDesc,
                payment.amount,
                payment.MpesaReceiptNumber,
                payment.TransactionDate,
                payment.PhoneNumber
            ],
            function(err) {
                if (err) {
                    return console.error('Error inserting demo data:', err.message);
                }
                console.log(`Inserted row with ID: ${this.lastID}`);
            }
        );
    });
};

// Clear the database and insert demo data
clearDatabase();
insertDemoData();
