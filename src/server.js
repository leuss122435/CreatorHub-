require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { setIO } = require('./utils/realtime');
const { connectDB } = require('./config/db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Routers
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/events', require('./routes/events.routes'));
app.use('/api/scripts', require('./routes/scripts.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
app.use('/api/integrations', require('./routes/integrations.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// Socket.IO basic events
setIO(io);

io.on('connection', (socket) => {
  // Optional auth to join a personal room for notifications
  socket.on('auth:identify', (token) => {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.join(`user:${payload.sub}`);
    } catch (e) {
      // ignore invalid token
    }
  });

  socket.on('joinProject', (projectId) => {
    socket.join(`project:${projectId}`);
  });
  socket.on('leaveProject', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  // Realtime collaborative script editing broadcast
  socket.on('script:edit', ({ projectId, scriptId, ops }) => {
    if (!projectId || !scriptId) return;
    socket.to(`project:${projectId}`).emit('script:edit', { scriptId, ops });
  });
});

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    server.listen(PORT, () => console.log(`API listening on :${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
})();
