// backend/server.js
const express      = require('express');
const cors         = require('cors');
const mongoose     = require('mongoose');
require('dotenv').config();

// const { loadPermissions } = require('./services/permissionService');
// const authRouter   = require('./routes/authRouter');
// const leaveRouter  = require('./routes/leaveRoutes');
// const authenticate = require('./middleware/authMiddleware');  // only once here

async function start() {
  try {
    // 1) Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected…');

    // 2) Load permissions
    await loadPermissions();
    console.log('Permissions loaded');

    // 3) Start Express
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Public auth routes
    app.use('/api/auth', authRouter);

    // Protected leave routes
    app.use('/api/leaves', authenticate, leaveRouter);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Server failed to start:', err);
    process.exit(1);
  }
}

start();
