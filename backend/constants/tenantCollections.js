/**
 * Platform-level collection — no companyId (defines tenants).
 */
const PLATFORM_COLLECTIONS = Object.freeze(['companies']);

/**
 * All business collections that MUST carry companyId.
 * Aligns with Appendix B of MPBCDC_IMPLEMENTATION_GUIDE.
 */
const TENANT_SCOPED_COLLECTIONS = Object.freeze([
  'users',
  'mpbcdc_employees',
  'departments',
  'designations',
  'grades',
  'regions',
  'districts',
  'loan_types',
  'loan_eligibility_rules',
  'loan_applications',
  'loan_approvals',
  'loan_disbursements',
  'loan_emi_schedules',
  'loan_recoveries',
  'loan_closures',
  'leave_types',
  'holidays',
  'leave_accrual_rules',
  'leave_balances',
  'leave_applications',
  'leave_approvals',
  'promotion_histories',
  'salary_revisions',
  'transfer_histories',
  'disciplinary_cases',
  'employee_documents',
  'approval_matrices',
  'notification_templates',
  'notifications',
  'audit_logs',
]);

module.exports = {
  PLATFORM_COLLECTIONS,
  TENANT_SCOPED_COLLECTIONS,
};
