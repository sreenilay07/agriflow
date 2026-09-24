const { getIO } = require('../../socket/socket.handler');
const logger = require('../../utils/logger');
const EVENT_TYPES = require('./eventTypes');
const ROOMS = require('./socketRooms');
const Notification = require('../../models/Notification');

/**
 * Emit a realtime event to specific rooms and optionally create a persistent notification.
 * 
 * @param {string} eventType - The event key from EVENT_TYPES
 * @param {object} payload - The event payload data
 * @param {string|string[]} targetRooms - Array of rooms or single room string
 * @param {object} [notificationOptions] - Optional persistent notification params
 */
const emitRealtimeEvent = async (eventType, payload = {}, targetRooms = [], notificationOptions = null) => {
  try {
    const io = getIO();
    const rooms = Array.isArray(targetRooms) ? targetRooms : [targetRooms];

    if (io) {
      if (rooms.length === 0) {
        // Broadcast globally
        io.emit(eventType, payload);
      } else {
        rooms.forEach((room) => {
          if (room) {
            io.to(room).emit(eventType, payload);
          }
        });
      }
      logger.info(`[REALTIME EVENT] Emitted ${eventType} to rooms: [${rooms.join(', ')}]`);
    }

    // Persist Notification if requested
    if (notificationOptions && notificationOptions.userId) {
      try {
        const notif = await Notification.create({
          userId: notificationOptions.userId,
          type: notificationOptions.type || 'SYSTEM_ALERT',
          title: notificationOptions.title || 'System Notification',
          message: notificationOptions.message || '',
          priority: notificationOptions.priority || 'MEDIUM',
          entityType: notificationOptions.entityType,
          entityId: notificationOptions.entityId,
          data: payload,
          read: false
        });

        // Also emit notification:created directly to user's private socket room
        if (io) {
          io.to(ROOMS.user(notificationOptions.userId)).emit(EVENT_TYPES.NOTIFICATION_CREATED, notif);
        }
      } catch (notifErr) {
        logger.error(`[NOTIFICATION PERSISTENCE FAILED]: ${notifErr.message}`);
      }
    }
  } catch (err) {
    logger.error(`[REALTIME EMIT FAILED] Event: ${eventType} Error: ${err.message}`);
  }
};

module.exports = {
  EVENT_TYPES,
  ROOMS,
  emitRealtimeEvent
};
