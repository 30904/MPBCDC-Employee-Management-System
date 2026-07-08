const mongoose = require('mongoose');
const createTenantModel = require('./createTenantModel');
const { LEAVE_APPROVAL_DECISION } = require('../constants/leaveWorkflowStates');

const DECISIONS = Object.values(LEAVE_APPROVAL_DECISION);

const ESCALATION_STATUSES = Object.freeze(['OnTime', 'Escalated', 'Overdue']);

/**
 * One row per approval action on a leave application (Sheet 04 — Approval Workflow, row 14).
 */
const LeaveApproval = createTenantModel({
  modelName: 'LeaveApproval',
  collection: 'leave_approvals',
  fields: {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LeaveApplication',
      required: [true, 'applicationId is required'],
    },
    applicationNo: {
      type: String,
      required: [true, 'applicationNo is required'],
      trim: true,
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
    escalationStatus: {
      type: String,
      enum: ESCALATION_STATUSES,
      default: 'OnTime',
    },
    nextApproverRole: {
      type: String,
      trim: true,
      default: null,
    },
  },
});

module.exports = LeaveApproval;
module.exports.ESCALATION_STATUSES = ESCALATION_STATUSES;
