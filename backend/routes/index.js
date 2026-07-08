const express = require('express');
const authRoutes = require('./authRoutes');
const companyRoutes = require('./companyRoutes');
const employeeRoutes = require('./employeeRoutes');
const uploadRoutes = require('./uploadRoutes');
const autoNumberRoutes = require('./autoNumberRoutes');
const dateRoutes = require('./dateRoutes');
const leaveRoutes = require('./leaveRoutes');
const loanRoutes = require('./loanRoutes');
const loanTypeRoutes = require('./loanTypeRoutes');
const loanEligibilityRuleRoutes = require('./loanEligibilityRuleRoutes');
const approvalMatrixRoutes = require('./approvalMatrixRoutes');
const loanApplicationRoutes = require('./loanApplicationRoutes');
const loanDisbursementRoutes = require('./loanDisbursementRoutes');
const loanRecoveryRoutes = require('./loanRecoveryRoutes');
const authMiddleware = require('../middleware/authMiddleware');
const tenantResolver = require('../middleware/tenantResolver');
const authorizeRoles = require('../middleware/authorizeRoles');
const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');
const { ROLES } = require('../utils/roles');
const { API_BASE_PATH, API_INFO } = require('../config/api');
const leaveTypeRoutes = require('./leaveTypeRoutes');
const holidayRoutes = require('./holidayRoutes');
const leaveAccrualRuleRoutes = require('./leaveAccrualRuleRoutes');
const leaveBalanceRoutes = require('./leaveBalanceRoutes');
const leaveApplicationRoutes = require('./leaveApplicationRoutes');
const leaveReportRoutes = require('./leaveReportRoutes');

const RESPONSE_CONVENTION = {
  success: { success: true, data: '<payload>' },
  paginated: {
    success: true,
    data: '<array>',
    meta: {
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    },
  },
  error: { success: false, error: '<message>' },
  paginationQuery: '?page=1&limit=20',
  autoNumbers: {
    format: '{PREFIX}-{YEAR}-{#####}',
    examples: ['LN-2026-00001', 'LV-2026-00001', 'SR-2026-00001'],
    scope: 'Per companyId sequence',
  },
  fileUpload: {
    contentType: 'multipart/form-data',
    fieldName: 'file',
    maxSizeMb: 5,
    allowedTypes: ['application/pdf'],
    endpoint: `${API_BASE_PATH}/uploads`,
  },
  dates: {
    api: 'ISO 8601',
    apiExamples: ['2026-07-04', '2026-07-04T10:30:00.000Z'],
    ui: 'DD-MMM-YYYY',
    uiExample: '04-Jul-2026',
  },
};

const router = express.Router();

/**
 * GET /api — API root (convention: all routes under /api)
 */
router.get('/', (_req, res) => {
  sendSuccess(res, {
    ...API_INFO,
    responseConvention: RESPONSE_CONVENTION,
    endpoints: {
      health: `${API_BASE_PATH}/health`,
      auth: {
        login: `${API_BASE_PATH}/auth/login`,
        me: `${API_BASE_PATH}/auth/me`,
      },
      companies: `${API_BASE_PATH}/companies?page=1&limit=20`,
      uploads: {
        formats: `${API_BASE_PATH}/uploads/formats`,
        create: `${API_BASE_PATH}/uploads`,
      },
      autoNumbers: {
        formats: `${API_BASE_PATH}/auto-numbers/formats`,
        preview: `${API_BASE_PATH}/auto-numbers/preview/:prefix`,
      },
      dates: {
        formats: `${API_BASE_PATH}/dates/formats`,
      },
      loanTypes: `${API_BASE_PATH}/loan-types?page=1&limit=20`,
      loanEligibilityRules: `${API_BASE_PATH}/loan-eligibility-rules?page=1&limit=20`,
      approvalMatrices: `${API_BASE_PATH}/approval-matrices?module=LOAN`,
      loanApplicationQueue: `${API_BASE_PATH}/loan-applications/queue`,
      loanApplications: `${API_BASE_PATH}/loan-applications?page=1&limit=20`,
      loanApplicationsMine: `${API_BASE_PATH}/loan-applications/mine?page=1&limit=20`,
      loanApplicationSubmit: `${API_BASE_PATH}/loan-applications/:id/submit`,
      loanDisbursements: `${API_BASE_PATH}/loan-disbursements`,
      loanDisbursementsPending: `${API_BASE_PATH}/loan-disbursements/pending`,
      loanRecoveries: `${API_BASE_PATH}/loan-recoveries`,
      loanRecoveriesPending: `${API_BASE_PATH}/loan-recoveries/pending?payrollMonth=YYYY-MM`,
      loanPreviewEligibility: `${API_BASE_PATH}/loans/preview-eligibility?loanTypeId=&requestedAmount=&requestedTenure=`,
      tenantPing: `${API_BASE_PATH}/tenant/ping`,
      leaveTypes: `${API_BASE_PATH}/leave-types?page=1&limit=20`,
      holidays: `${API_BASE_PATH}/holidays?year=2026&page=1&limit=20`,
      leaveAccrualRules: `${API_BASE_PATH}/leave-accrual-rules?page=1&limit=20`,
      leaveAccrualRun: `${API_BASE_PATH}/leave-accrual-rules/run`,
      leaveBalances: `${API_BASE_PATH}/leave-balances?page=1&limit=20`,
      leaveYearEndClose: `${API_BASE_PATH}/leave-balances/year-end-close`,
      leaveApplications: `${API_BASE_PATH}/leave-applications?page=1&limit=20`,
      leaveApplicationQueue: `${API_BASE_PATH}/leave-applications/queue`,
      leaveReportsSummary: `${API_BASE_PATH}/leave-reports/summary?year=2026`,
      leaveReportsSummaryCsv: `${API_BASE_PATH}/leave-reports/summary.csv?year=2026`,
      leaveReportsDetails: `${API_BASE_PATH}/leave-reports/details?year=2026&page=1&limit=20`,
      approvalMatricesLeaveInit: `${API_BASE_PATH}/approval-matrices/initialize-leave-default`,
    },
  });
});

router.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'ok', service: API_INFO.name, basePath: API_BASE_PATH });
});

router.use('/auth', authRoutes);
router.use('/companies', companyRoutes);
router.use('/employees', employeeRoutes);
router.use('/uploads', uploadRoutes);
router.use('/auto-numbers', autoNumberRoutes);
router.use('/dates', dateRoutes);
router.use('/leaves', leaveRoutes);
router.use('/loans', loanRoutes);
router.use('/loan-types', loanTypeRoutes);
router.use('/loan-eligibility-rules', loanEligibilityRuleRoutes);
router.use('/approval-matrices', approvalMatrixRoutes);
router.use('/loan-applications', loanApplicationRoutes);
router.use('/loan-disbursements', loanDisbursementRoutes);
router.use('/loan-recoveries', loanRecoveryRoutes);
router.use('/leave-types', leaveTypeRoutes);
router.use('/holidays', holidayRoutes);
router.use('/leave-accrual-rules', leaveAccrualRuleRoutes);
router.use('/leave-balances', leaveBalanceRoutes);
router.use('/leave-applications', leaveApplicationRoutes);
router.use('/leave-reports', leaveReportRoutes);

// Tenant-scoped — SUPER_ADMIN may pass x-company-id header via tenantResolver
router.get(
  '/tenant/ping',
  authMiddleware,
  tenantResolver,
  authorizeRoles(...Object.values(ROLES)),
  asyncHandler(async (req, res) => {
    const tenantUserCount = await User.forTenant(req.companyId).countDocuments();

    sendSuccess(res, {
      message: 'Tenant context resolved',
      companyId: req.companyId,
      userId: req.user.id,
      tenantUserCount,
      actingAsTenant: Boolean(req.tenantCompany),
      tenantName: req.tenantCompany?.name ?? null,
    });
  })
);

module.exports = router;
