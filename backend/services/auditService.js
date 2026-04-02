const AuditLog = require('../models/AuditLog');

exports.logEvent = async ({
  action,
  entity,
  entityId,
  user,
  metadata,
  ipAddress,
  userAgent,
}) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      user,
      metadata,
      ipAddress,
      userAgent,
    });
  } catch (err) {
    // Audit logging must never break core API behavior.
    console.error('Audit log write failed:', err.message);
  }
};
