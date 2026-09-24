const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const { UnauthorizedError, ForbiddenError } = require('../utils/customErrors');
const { ROLES, normalizeRole } = require('../constants/roles');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new UnauthorizedError('Authentication token missing. Please login.', 'NO_TOKEN');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new UnauthorizedError('User belonging to this token no longer exists.', 'USER_NOT_FOUND');
    }

    const isStatusCheckRoute = req.originalUrl.match(/\/auth\/(me|logout)\/?$/i);

    if (user.status === 'PENDING' && !isStatusCheckRoute) {
      throw new ForbiddenError('Your registration request is pending approval.', 'ACCOUNT_PENDING_APPROVAL');
    }

    if (user.status === 'REJECTED' && !isStatusCheckRoute) {
      throw new ForbiddenError('Your registration request was rejected.', 'ACCOUNT_REJECTED');
    }

    if (user.status === 'SUSPENDED' && !isStatusCheckRoute) {
      throw new ForbiddenError('Your account has been suspended.', 'ACCOUNT_SUSPENDED');
    }

    if (user.status !== 'APPROVED' && user.status !== 'ACTIVE' && !isStatusCheckRoute) {
      throw new ForbiddenError('Account is not active or approved.', 'ACCOUNT_INACTIVE');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new UnauthorizedError('Invalid or expired authentication token.'));
    }
    next(error);
  }
};

const authenticateUser = protect;

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('User authentication required.'));
    }

    const userRole = normalizeRole(req.user.role);
    const normalizedAllowed = allowedRoles.map((r) => normalizeRole(r));

    // Platform / Super Admins have administrative bypass
    if (userRole === 'PLATFORM_ADMIN') {
      return next();
    }

    if (!normalizedAllowed.includes(userRole)) {
      return next(new ForbiddenError(`Access denied. Role '${req.user.role}' is not authorized for this resource.`));
    }

    next();
  };
};

const authorizeRoles = requireRole;

const authorizeCentre = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required.'));
  }

  if (normalizeRole(req.user.role) === 'PLATFORM_ADMIN') {
    return next();
  }

  const targetCentreId = req.params.centreId || req.body.centreId || req.query.centreId;

  if (!targetCentreId) {
    return next();
  }

  if (req.user.centreId && req.user.centreId.toString() === targetCentreId.toString()) {
    return next();
  }

  return next(new ForbiddenError('You are not authorized to manage or access this specific procurement centre.'));
};

const authorizeDistrict = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required.'));
  }

  if (normalizeRole(req.user.role) === 'PLATFORM_ADMIN') {
    return next();
  }

  const targetDistrictId = req.params.districtId || req.body.districtId || req.query.districtId;

  if (!targetDistrictId) {
    return next();
  }

  if (req.user.districtId && req.user.districtId.toString() === targetDistrictId.toString()) {
    return next();
  }

  return next(new ForbiddenError('You are not authorized to access data for this district.'));
};

const authorizeOrganization = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required.'));
  }

  if (normalizeRole(req.user.role) === 'PLATFORM_ADMIN') {
    return next();
  }

  const targetOrgId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
  if (!targetOrgId || !req.user.organizationId) {
    return next();
  }

  if (req.user.organizationId.toString() === targetOrgId.toString()) {
    return next();
  }

  return next(new ForbiddenError('Access denied: Entity belongs to another organization.'));
};

const authorizeRegion = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('User authentication required.'));
  }

  if (normalizeRole(req.user.role) === 'PLATFORM_ADMIN') {
    return next();
  }

  const targetRegionId = req.params.regionId || req.body.regionId || req.query.regionId;
  if (!targetRegionId || !req.user.regionId) {
    return next();
  }

  if (req.user.regionId.toString() === targetRegionId.toString()) {
    return next();
  }

  return next(new ForbiddenError('Access denied: Entity belongs to another region.'));
};

module.exports = {
  protect,
  authenticate: protect,
  authenticateUser,
  requireRole,
  authorize: requireRole,
  authorizeRoles,
  authorizeCentre,
  authorizeDistrict,
  authorizeOrganization,
  authorizeRegion
};
