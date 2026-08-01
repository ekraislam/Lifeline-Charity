require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);

// Robust Top-Level CORS Middleware (Must be before helmet and body parsers)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, Access-Control-Allow-Origin');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// Trust proxy behind Cloudflare/Nginx
app.set('trust proxy', 1);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./src/routes/auth.routes');
const profileRoutes = require('./src/routes/profile.routes');
const campaignRoutes = require('./src/routes/campaign.routes');
const donationRoutes = require('./src/routes/donation.routes');
const volunteerRoutes = require('./src/routes/volunteer.routes');
const beneficiaryRoutes = require('./src/routes/beneficiary.routes');
const eventRoutes = require('./src/routes/event.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const searchRoutes = require('./src/routes/search.routes');
const fileRoutes = require('./src/routes/file.routes');
const adminRoutes = require('./src/routes/admin.routes');
const categoryRoutes = require('./src/routes/category.routes');
const contactRoutes = require('./src/routes/contact.routes');
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);

// Serve static uploads
app.use('/uploads', express.static('uploads'));

// Centralized Error Handling Middleware
const errorHandler = require('./src/middlewares/error.middleware');
app.use(errorHandler);

// Basic Route
app.get('/', (req, res) => {
  res.send('Lifeline API is running...');
});

// Auto-initialize database schema if missing
const initDb = require('./src/config/initDb');

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await initDb();
});

// Initialize Socket.io
const { initSocket } = require('./src/sockets/socket');
initSocket(server);
