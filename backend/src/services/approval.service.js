const ApprovalRequest = require('../models/ApprovalRequest');
const User = require('../models/User');
const ProcurementCentre = require('../models/ProcurementCentre');
const District = require('../models/District');
const AuditLog = require('../models/AuditLog');
const socketHandler = require('../socket/socket.handler');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/customErrors');
const { ROLES, normalizeRole } = require('../constants/roles');

class ApprovalService {
  /**
   * Get pending Centre Manager registration requests for a specific District Admin's district
   */
  async getPendingCentreManagersForDistrict(districtId) {
    if (!districtId) {
      throw new BadRequestError('District ID is required.');
    }

    return await ApprovalRequest.find({
      requestedRole: { $in: ['CENTER_MANAGER', 'CENTRE_MANAGER'] },
      districtId,
      status: 'PENDING'
    })
      .populate('userId', 'fullName phoneNumber email state district employeeId createdAt')
      .populate('centreId', 'name code districtId')
      .populate('districtId', 'name state code')
      .sort({ createdAt: -1 });
  }

  /**
   * Get pending Centre Operator registration requests for a specific Centre Manager's centre
   */
  async getPendingCentreOperatorsForCentre(centreId) {
    if (!centreId) {
      throw new BadRequestError('Centre ID is required.');
    }

    return await ApprovalRequest.find({
      requestedRole: { $in: ['CENTER_OPERATOR', 'PROCUREMENT_OFFICER'] },
      centreId,
      status: 'PENDING'
    })
      .populate('userId', 'fullName phoneNumber email state district employeeId createdAt')
      .populate('centreId', 'name code districtId')
      .sort({ createdAt: -1 });
  }

  /**
   * Get pending District Admin registration requests (Super Admin only)
   */
  async getPendingDistrictAdmins() {
    return await ApprovalRequest.find({
      requestedRole: { $in: ['DISTRICT_ADMIN', 'DISTRICT_OFFICER'] },
      status: 'PENDING'
    })
      .populate('userId', 'fullName phoneNumber email state district employeeId createdAt')
      .populate('districtId', 'name state code')
      .sort({ createdAt: -1 });
  }

  /**
   * Approve a pending registration request with strict hierarchy enforcement
   */
  async approveRequest(requestId, reviewer, remarks = '') {
    const request = await ApprovalRequest.findById(requestId).populate('userId');
    if (!request) {
      throw new NotFoundError('Approval request not found.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError(`Approval request is already ${request.status}.`);
    }

    const reviewerRole = normalizeRole(reviewer.role);
    const requestedRole = normalizeRole(request.requestedRole);

    // ENFORCE HIERARCHY PERMISSIONS
    if (requestedRole === 'DISTRICT_ADMIN') {
      if (reviewerRole !== 'PLATFORM_ADMIN') {
        throw new ForbiddenError('Only Super Admin can approve District Admin registrations.', 'HIERARCHY_VIOLATION');
      }
    } else if (requestedRole === 'COLLECTION_CENTRE_MANAGER') {
      if (reviewerRole !== 'PLATFORM_ADMIN' && reviewerRole !== 'DISTRICT_ADMIN') {
        throw new ForbiddenError('Only District Admin or Super Admin can approve Centre Manager registrations.', 'HIERARCHY_VIOLATION');
      }
      if (reviewerRole === 'DISTRICT_ADMIN') {
        if (!reviewer.districtId || reviewer.districtId.toString() !== request.districtId?.toString()) {
          throw new ForbiddenError('District Admin can only approve Centre Managers for their assigned district.', 'HIERARCHY_VIOLATION');
        }
      }
    } else if (requestedRole === 'CENTER_OPERATOR' || requestedRole === 'QUALITY_INSPECTOR') {
      if (reviewerRole !== 'PLATFORM_ADMIN' && reviewerRole !== 'COLLECTION_CENTRE_MANAGER') {
        throw new ForbiddenError('Only assigned Centre Manager or Super Admin can approve Centre Operators.', 'HIERARCHY_VIOLATION');
      }
      if (reviewerRole === 'COLLECTION_CENTRE_MANAGER') {
        if (!reviewer.centreId || reviewer.centreId.toString() !== request.centreId?.toString()) {
          throw new ForbiddenError('Centre Manager can only approve Centre Operators assigned to their own centre.', 'HIERARCHY_VIOLATION');
        }
      }
    } else {
      throw new BadRequestError(`Invalid requested role: ${request.requestedRole}`);
    }

    // UPDATE APPROVAL REQUEST
    request.status = 'APPROVED';
    request.reviewedBy = reviewer._id;
    request.reviewedAt = new Date();
    request.remarks = remarks || 'Approved';
    await request.save();

    // UPDATE USER ACCOUNT
    const user = await User.findById(request.userId._id || request.userId);
    if (!user) {
      throw new NotFoundError('Associated user record not found.');
    }

    user.status = 'APPROVED';
    user.isPhoneVerified = true;
    await user.save();

    // AUDIT LOG
    await AuditLog.create({
      actorId: reviewer._id,
      actorRole: reviewerRole,
      action: 'APPROVE_USER',
      targetType: 'USER',
      targetId: user._id,
      metadata: {
        approvalRequestId: request._id,
        requestedRole: request.requestedRole,
        districtId: request.districtId,
        centreId: request.centreId,
        remarks
      }
    });

    // Notify User via Socket
    socketHandler.emitUserEvent(user._id, 'approval:status', {
      status: 'APPROVED',
      message: 'Your registration request has been approved. You can now login.'
    });

    return {
      message: `User ${user.fullName} (${user.role}) has been successfully approved.`,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      },
      approvalRequest: request
    };
  }

  /**
   * Reject a pending registration request with strict hierarchy enforcement
   */
  async rejectRequest(requestId, reviewer, rejectionReason = '', remarks = '') {
    if (!rejectionReason) {
      throw new BadRequestError('A rejection reason is required.');
    }

    const request = await ApprovalRequest.findById(requestId).populate('userId');
    if (!request) {
      throw new NotFoundError('Approval request not found.');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestError(`Approval request is already ${request.status}.`);
    }

    const reviewerRole = normalizeRole(reviewer.role);
    const requestedRole = normalizeRole(request.requestedRole);

    // ENFORCE HIERARCHY PERMISSIONS
    if (requestedRole === 'DISTRICT_ADMIN') {
      if (reviewerRole !== 'PLATFORM_ADMIN') {
        throw new ForbiddenError('Only Super Admin can reject District Admin registrations.', 'HIERARCHY_VIOLATION');
      }
    } else if (requestedRole === 'COLLECTION_CENTRE_MANAGER') {
      if (reviewerRole !== 'PLATFORM_ADMIN' && reviewerRole !== 'DISTRICT_ADMIN') {
        throw new ForbiddenError('Only District Admin or Super Admin can reject Centre Manager registrations.', 'HIERARCHY_VIOLATION');
      }
      if (reviewerRole === 'DISTRICT_ADMIN') {
        if (!reviewer.districtId || reviewer.districtId.toString() !== request.districtId?.toString()) {
          throw new ForbiddenError('District Admin can only reject Centre Managers for their assigned district.', 'HIERARCHY_VIOLATION');
        }
      }
    } else if (requestedRole === 'CENTER_OPERATOR' || requestedRole === 'QUALITY_INSPECTOR') {
      if (reviewerRole !== 'PLATFORM_ADMIN' && reviewerRole !== 'COLLECTION_CENTRE_MANAGER') {
        throw new ForbiddenError('Only assigned Centre Manager or Super Admin can reject Centre Operators.', 'HIERARCHY_VIOLATION');
      }
      if (reviewerRole === 'COLLECTION_CENTRE_MANAGER') {
        if (!reviewer.centreId || reviewer.centreId.toString() !== request.centreId?.toString()) {
          throw new ForbiddenError('Centre Manager can only reject Centre Operators assigned to their own centre.', 'HIERARCHY_VIOLATION');
        }
      }
    } else {
      throw new BadRequestError(`Invalid requested role: ${request.requestedRole}`);
    }

    // UPDATE APPROVAL REQUEST
    request.status = 'REJECTED';
    request.reviewedBy = reviewer._id;
    request.reviewedAt = new Date();
    request.rejectionReason = rejectionReason;
    request.remarks = remarks || '';
    await request.save();

    // UPDATE USER ACCOUNT
    const user = await User.findById(request.userId._id || request.userId);
    if (user) {
      user.status = 'REJECTED';
      await user.save();
    }

    // AUDIT LOG
    await AuditLog.create({
      actorId: reviewer._id,
      actorRole: reviewerRole,
      action: 'REJECT_USER',
      targetType: 'USER',
      targetId: user?._id,
      metadata: {
        approvalRequestId: request._id,
        requestedRole: request.requestedRole,
        rejectionReason,
        remarks
      }
    });

    if (user) {
      socketHandler.emitUserEvent(user._id, 'approval:status', {
        status: 'REJECTED',
        rejectionReason,
        message: 'Your registration request was rejected.'
      });
    }

    return {
      message: `Registration request for ${user?.fullName || 'User'} has been rejected.`,
      user: user ? { _id: user._id, fullName: user.fullName, status: user.status } : null,
      approvalRequest: request
    };
  }
}

module.exports = new ApprovalService();
