const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Create an in-app notification for the employee linked to an employeeId.
 */
async function notifyEmployee({
  companyId,
  employeeId,
  title,
  message,
  entityType = '',
  entityId = null,
}) {
  if (!companyId || !employeeId) {
    return null;
  }

  const user = await User.forTenant(companyId)
    .findOne({ employeeId, status: 'Active' })
    .select('_id');

  if (!user) {
    return null;
  }

  return Notification.forTenant(companyId).create({
    userId: user._id,
    title: String(title || '').trim(),
    message: String(message || '').trim(),
    entityType: String(entityType || '').trim(),
    entityId,
  });
}

module.exports = {
  notifyEmployee,
};
