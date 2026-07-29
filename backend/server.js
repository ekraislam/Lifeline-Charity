require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const server = http.createServer(app);

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  process.env.CORS_ORIGIN_1,
  process.env.CORS_ORIGIN_2,
  process.env.CORS_ORIGIN_3
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Trust proxy for rate limiting behind Cloudflare/Nginx
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

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

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Initialize Socket.io
const { initSocket } = require('./src/sockets/socket');
initSocket(server);
