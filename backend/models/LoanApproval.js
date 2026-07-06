const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LOAN_APPROVAL_DECISION } = require('../constants/loanWorkflowStates');

const DECISIONS = Object.values(LOAN_APPROVAL_DECISION);

/**
 * One row per approval action on a loan application.
 */
const LoanApproval = createTenantModel({
  modelName: 'LoanApproval',
  collection: 'loan_approvals',
  fields: {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: [true, 'applicationId is required'],
    },
    approverRole: {
      type: String,
      required: [true, 'approverRole is required'],
      trim: true,
    },
    approverUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'approverUserId is required'],
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
    decision: {
      type: String,
      enum: DECISIONS,
      required: [true, 'decision is required'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
    signatureFilePath: {
      type: String,
      trim: true,
      default: null,
    },
    signatureDataUrl: {
      type: String,
      default: null,
    },
    nextApproverRole: {
      type: String,
      trim: true,
      default: null,
    },
  },
});

module.exports = LoanApproval;
