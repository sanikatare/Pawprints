const Notification = require('../models/Notification');

async function createNotification(userId, type, title, message, data = {}) {
  const notification = new Notification({
    user: userId,
    type,
    title,
    message,
    data,
  });
  await notification.save();
  return notification;
}

module.exports = { createNotification };
