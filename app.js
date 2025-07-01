const express = require('express');
const sequelize = require('./environment/databaseConfig.js');
const cors = require('cors');
const app = express();
const db = require('./models'); // Import models (from models/index.js)
const { ApiLog } = require('./models');  // Add this after importing db

// const { Tour, Itinerary } = require('./models/packages');

// Configure CORS with specific options
const corsOptions = {
  origin: [
    'https://crm.mahaballoonadventures.ae',
    'https://mahaballoonadventures.ae',
    'www.mahaballoonadventures.ae',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 
// Tour.associate({ Itinerary });
// Itinerary.associate({ Tour });

// Logging Middleware - Logs every request and response
app.use(async (req, res, next) => {
  const requestTime = new Date(); // Capture request timestamp

  // Capture original response send method
  const originalSend = res.send;

  res.send = async function (body) {
    try {
      const data = await ApiLog.create({
        method: req.method,
        endpoint: req.originalUrl,
        request_body: req.body,
        response_body: body,
        status_code: res.statusCode,
        timestamp: requestTime,
      });
      // console.log(data,'data')

    } catch (error) {
      console.error('Error logging API request:', error);
    }
    originalSend.apply(res, arguments); // Continue response
  };

  next();
});




// routes start here
app.use('/api', require('./routes/userRoutes.js'));
app.use('/api', require('./routes/packagesRoutes.js'));
app.use('/api', require('./routes/itineraryRoutes.js'));
app.use('/api', require('./routes/slotsRoutes.js'));
app.use('/api', require('./routes/BookingRoutes.js'));
app.use('/api', require('./routes/passengerRoutes.js'));
app.use('/api', require('./routes/pickupRoutes.js'));
app.use('/api', require('./routes/flights.js'));
app.use('/api', require('./routes/referenceRoutes.js'));
app.use('/api', require('./services/webhook.js'));
app.use('/api', require('./routes/contactRoutes.js'))
app.use('/api', require('./routes/blogRoutes.js'))
app.use('/api', require('./routes/categoryRoutes.js'))
// app.use('/api',require('./routes/giftCardRoutes.js'))
app.use('/api', require('./routes/BankRoutes.js'))
app.use('/api', require('./services/zoho_webhook.js'))
app.use('/api', require('./services/waba.js'))
app.use('/api', require('./services/cancel_zoho.js'))
// app.use('/api'.require('./s'))
// routes end here
app.get('/', (req, res) => {
  res.status(200).json({ message: "Server responding" });
});

sequelize.sync()
  .then(() => {
    console.log('Database synced successfully');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const awsServerlessExpress = require('aws-serverless-express');
const server = awsServerlessExpress.createServer(app);

module.exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context);
