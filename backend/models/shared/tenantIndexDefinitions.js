/**
 * Compound index definitions for all tenant-scoped collections.
 * Every entry includes companyId as the leading key.
 *
 * @typedef {{ fields: Record<string, number>, options?: import('mongoose').IndexOptions }} TenantIndexSpec
 */

/** @type {Record<string, TenantIndexSpec[]>} */
const TENANT_COMPOUND_INDEXES = Object.freeze({
  users: [
    { fields: { loginId: 1 }, options: { unique: true } },
    { fields: { status: 1 } },
  ],

  mpbcdc_employees: [{ fields: { employeeCode: 1 }, options: { unique: true } }],

  departments: [{ fields: { name: 1 }, options: { unique: true } }],

  designations: [{ fields: { name: 1 }, options: { unique: true } }],

  grades: [{ fields: { code: 1 }, options: { unique: true } }],

  regions: [{ fields: { code: 1 }, options: { unique: true } }],

  districts: [
    { fields: { code: 1 }, options: { unique: true } },
    { fields: { regionId: 1 } },
  ],

  loan_types: [{ fields: { code: 1 }, options: { unique: true } }],

  loan_eligibility_rules: [{ fields: { ruleCode: 1 }, options: { unique: true } }],

  loan_applications: [
    { fields: { applicationNo: 1 }, options: { unique: true } },
    { fields: { employeeId: 1, status: 1 } },
    { fields: { status: 1, createdAt: -1 } },
  ],

  loan_approvals: [
    { fields: { applicationId: 1, approverRole: 1 } },
    { fields: { applicationId: 1, approvedAt: -1 } },
  ],

  loan_disbursements: [{ fields: { disbursementNo: 1 }, options: { unique: true } }],

  loan_emi_schedules: [
    { fields: { loanNo: 1, emiNo: 1 }, options: { unique: true } },
    { fields: { loanNo: 1, dueDate: 1 } },
  ],

  loan_recoveries: [
    { fields: { loanNo: 1, payrollMonth: 1 }, options: { unique: true } },
  ],

  loan_closures: [{ fields: { closureNo: 1 }, options: { unique: true } }],

  leave_types: [{ fields: { code: 1 }, options: { unique: true } }],

  holidays: [{ fields: { date: 1, regionId: 1 } }],

  leave_accrual_rules: [
    { fields: { ruleCode: 1, leaveTypeId: 1 }, options: { unique: true } },
  ],

  leave_balances: [
    {
      fields: { employeeId: 1, leaveTypeId: 1, period: 1 },
      options: { unique: true },
    },
  ],

  leave_applications: [
    { fields: { applicationNo: 1 }, options: { unique: true } },
    { fields: { employeeId: 1, status: 1 } },
    { fields: { fromDate: 1, toDate: 1 } },
  ],

  leave_approvals: [{ fields: { applicationId: 1, approvedAt: -1 } }],

  promotion_histories: [{ fields: { employeeId: 1, createdAt: -1 } }],

  salary_revisions: [{ fields: { employeeId: 1, effectiveDate: -1 } }],

  transfer_histories: [{ fields: { employeeId: 1, createdAt: -1 } }],

  disciplinary_cases: [{ fields: { employeeId: 1, createdAt: -1 } }],

  employee_documents: [{ fields: { employeeId: 1, category: 1 } }],

  approval_matrices: [
    {
      fields: { code: 1, module: 1, gradeId: 1, level: 1 },
      options: { unique: true },
    },
  ],

  notification_templates: [{ fields: { templateCode: 1 }, options: { unique: true } }],

  notifications: [
    { fields: { userId: 1, createdAt: -1 } },
    { fields: { userId: 1, readAt: 1 } },
  ],

  audit_logs: [
    { fields: { timestamp: -1 } },
    { fields: { entity: 1, entityId: 1 } },
    { fields: { userId: 1, timestamp: -1 } },
  ],
});

module.exports = {
  TENANT_COMPOUND_INDEXES,
};
