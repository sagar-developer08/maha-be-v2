const axios = require("axios");
// const { TABBY_API_KEY, TABBY_BASE_URL } = require("");

// Create Payment Session
app.post('/create-payment', async (req, res) => {
    const { amount, currency, description, buyer } = req.body;

    try {
        const response = await axios.post('https://api.tabby.ai/v1/payments', {
            amount,
            currency,
            description,
            buyer: {
                email: buyer.email,
                phone: buyer.phone,
                name: buyer.name
            },
            merchant_code: TOUAE,
            payment_methods: ["installments"]
        }, {
            headers: {
                'Authorization': `Bearer ${SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const paymentSession = response.data;
        res.json(paymentSession);

    } catch (error) {
        console.error('Error creating payment session:', error);
        res.status(500).send('Error creating payment session');
    }
});


// Handle Webhook from Tabby
exports.handleWebhook = async (req, res) => {
    console.log("Received Tabby Webhook Event:", req.body);
    // Process payment status update (store in DB, send email, etc.)
    res.sendStatus(200);
};
