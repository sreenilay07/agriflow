const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const logger = require('../utils/logger');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        socket.user = decoded;
      } catch (err) {
        logger.warn(`[SOCKET] Invalid token on connection attempt: ${err.message}`);
      }
    }
    next();
  });

  io.on('connection', (socket) => {
    logger.info(`[SOCKET CONNECTED] SocketId: ${socket.id}`);

    // Auto-join rooms if user is authenticated
    if (socket.user && socket.user.userId) {
      const uid = socket.user.userId;
      socket.join(`user:${uid}`);
      logger.info(`[SOCKET AUTO-JOIN] Socket ${socket.id} joined user:${uid}`);

      if (socket.user.role) {
        socket.join(`role:${socket.user.role}`);
        logger.info(`[SOCKET AUTO-JOIN] Socket ${socket.id} joined role:${socket.user.role}`);

        if (socket.user.role === 'FARMER') {
          socket.join(`farmer:${uid}`);
        } else if (socket.user.role === 'BUYER') {
          socket.join(`buyer:${uid}`);
        }
      }

      if (socket.user.centreId) {
        socket.join(`centre:${socket.user.centreId}`);
      }
    }

    // Explicit room subscriptions
    socket.on('join:farmer', (farmerId) => {
      socket.join(`farmer:${farmerId}`);
      logger.info(`[SOCKET JOIN] Socket ${socket.id} joined farmer:${farmerId}`);
    });

    socket.on('join:buyer', (buyerId) => {
      socket.join(`buyer:${buyerId}`);
      logger.info(`[SOCKET JOIN] Socket ${socket.id} joined buyer:${buyerId}`);
    });

    socket.on('join:centre', (centreId) => {
      socket.join(`centre:${centreId}`);
      logger.info(`[SOCKET JOIN] Socket ${socket.id} joined centre:${centreId}`);
    });

    socket.on('join:warehouse', (warehouseId) => {
      socket.join(`warehouse:${warehouseId}`);
      logger.info(`[SOCKET JOIN] Socket ${socket.id} joined warehouse:${warehouseId}`);
    });

    socket.on('join:district', (districtId) => {
      socket.join(`district:${districtId}`);
      logger.info(`[SOCKET JOIN] Socket ${socket.id} joined district:${districtId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[SOCKET DISCONNECTED] SocketId: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    logger.warn('[SOCKET] Socket.IO instance requested before initialization');
  }
  return io;
};

const emitQueueUpdate = (centreId, payload) => {
  if (io) {
    io.to(`centre:${centreId}`).emit('queue:updated', payload);
  }
};

const emitFarmerEvent = (farmerId, event, payload) => {
  if (io) {
    io.to(`farmer:${farmerId}`).emit(event, payload);
    io.to(`user:${farmerId}`).emit(event, payload);
  }
};

const emitCentreEvent = (centreId, event, payload) => {
  if (io) {
    io.to(`centre:${centreId}`).emit(event, payload);
  }
};

const emitDistrictEvent = (districtId, event, payload) => {
  if (io) {
    io.to(`district:${districtId}`).emit(event, payload);
  }
};

const emitUserEvent = (userId, event, payload) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, payload);
    io.to(`farmer:${userId}`).emit(event, payload);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitQueueUpdate,
  emitFarmerEvent,
  emitCentreEvent,
  emitDistrictEvent,
  emitUserEvent
};
