const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { ROLES } = require('../utils/roles');
const { LOAN_MODULE } = require('../constants/loanWorkflowStates');

/**
 * Shared workflow master — approval levels per module (and optional grade).
 * Loan default: 3 approval levels handled by Admin.
 */
const ApprovalMatrix = createTenantModel({
  modelName: 'ApprovalMatrix',
  collection: 'approval_matrices',
  fields: {
    code: {
      type: String,
      required: [true, 'Workflow code is required'],
      trim: true,
      uppercase: true,
    },
    module: {
      type: String,
      required: [true, 'module is required'],
      trim: true,
      uppercase: true,
      enum: [LOAN_MODULE, 'LEAVE'],
    },
    gradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grade',
      default: null,
    },
    level: {
      type: Number,
      required: [true, 'Approval level is required'],
      min: [1, 'level must be at least 1'],
    },
    approverRole: {
      type: String,
      required: [true, 'approverRole is required'],
      enum: [ROLES.CLIENT_ADMIN],
    },
    slaDays: {
      type: Number,
      default: 3,
      min: [1, 'slaDays must be at least 1'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
});

module.exports = ApprovalMatrix;
