const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/RefreshToken');

const toMsFromDays = (days) => Number(days || 7) * 24 * 60 * 60 * 1000;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const signAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

const issueRefreshToken = async ({ user, ipAddress, userAgent }) => {
  const refreshToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + toMsFromDays(process.env.JWT_REFRESH_EXPIRE_DAYS));

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt,
    createdByIp: ipAddress || null,
    userAgent: userAgent || null,
  });

  return { refreshToken, tokenHash, expiresAt };
};

const rotateRefreshToken = async ({ providedToken, ipAddress, userAgent }) => {
  const providedTokenHash = hashToken(providedToken);

  const existing = await RefreshToken.findOne({ tokenHash: providedTokenHash }).populate({
    path: 'user',
    select: '+tokenVersion',
  });

  if (!existing || !existing.user) {
    return null;
  }

  if (existing.revokedAt || existing.expiresAt < new Date()) {
    return null;
  }

  if (existing.user.status !== 'active') {
    return null;
  }

  const nextRefreshToken = crypto.randomBytes(64).toString('hex');
  const nextTokenHash = hashToken(nextRefreshToken);
  const expiresAt = new Date(Date.now() + toMsFromDays(process.env.JWT_REFRESH_EXPIRE_DAYS));

  existing.revokedAt = new Date();
  existing.replacedByTokenHash = nextTokenHash;
  await existing.save();

  await RefreshToken.create({
    user: existing.user._id,
    tokenHash: nextTokenHash,
    expiresAt,
    createdByIp: ipAddress || null,
    userAgent: userAgent || null,
  });

  return {
    user: existing.user,
    refreshToken: nextRefreshToken,
    accessToken: signAccessToken(existing.user),
    expiresAt,
  };
};

const revokeRefreshToken = async (providedToken) => {
  const providedTokenHash = hashToken(providedToken);
  const existing = await RefreshToken.findOne({ tokenHash: providedTokenHash });

  if (!existing) {
    return false;
  }

  if (!existing.revokedAt) {
    existing.revokedAt = new Date();
    await existing.save();
  }

  return true;
};

const revokeAllUserRefreshTokens = async (userId) => {
  await RefreshToken.updateMany(
    { user: userId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
};

module.exports = {
  hashToken,
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
};
