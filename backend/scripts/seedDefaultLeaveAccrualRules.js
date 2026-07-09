/**
 * Seed default EL half-yearly accrual rule for a tenant (Sheet 04 — Task 3).
 *
 * Usage:
 *   node scripts/seedDefaultLeaveAccrualRules.js QWER1234
 *   npm run seed:leave-accrual-rules -- QWER1234
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const LeaveType = require('../models/LeaveType');
const LeaveAccrualRule = require('../models/LeaveAccrualRule');
const { startOfUtcDay } = require('../utils/dateUtils');

async function seedDefaultLeaveAccrualRules() {
  const requestedCode = String(process.argv[2] || process.env.SEED_COMPANY_CODE || '').trim().toUpperCase();

  await connectDB();

  let company = null;

  if (requestedCode) {
    company = await Company.findOne({ code: requestedCode, status: 'Active' });
    if (!company) {
      throw new Error(`Company not found or inactive: ${requestedCode}`);
    }
  } else {
    company = await Company.findOne({ status: 'Active' }).sort({ createdAt: 1 });
    if (!company) {
      throw new Error('No active company found. Create a company first or pass a company code.');
    }
  }

  const earnedLeave = await LeaveType.forTenant(company._id).findOne({ code: 'EL', isActive: true });

  if (!earnedLeave) {
    throw new Error('Earned Leave (EL) type not found. Run npm run seed:leave-types first.');
  }

  const defaultRule = {
    ruleCode: 'EL_HALF_YEARLY',
    leaveTypeId: earnedLeave._id,
    name: 'Earned Leave Half-Yearly Accrual',
    description: 'Credits EL on Jan 1 and Jul 1 with pro-rata for new joiners',
    accrualFrequency: 'HALF_YEARLY',
    accrualDays: 15,
    scheduledMonths: [1, 7],
    applyProRata: true,
    accumulationLimit: 300,
    effectiveDate: startOfUtcDay('2026-01-01'),
    status: 'Active',
  };

  await LeaveAccrualRule.forTenant(company._id).updateOne(
    { ruleCode: defaultRule.ruleCode, leaveTypeId: earnedLeave._id },
    { $set: defaultRule },
    { upsert: true }
  );

  const rules = await LeaveAccrualRule.forTenant(company._id)
    .find()
    .populate('leaveTypeId', 'code name')
    .sort({ ruleCode: 1 })
    .lean();

  console.log(`Default leave accrual rules seeded for ${company.name} (${company.code}):`);
  rules.forEach((rule) => {
    console.log(
      `- ${rule.ruleCode} | ${rule.leaveTypeId?.code} | ${rule.accrualFrequency} | months=${rule.scheduledMonths.join(',')} | days=${rule.accrualDays} | ${rule._id}`
    );
  });

  await mongoose.disconnect();
  process.exit(0);
}

seedDefaultLeaveAccrualRules().catch(async (error) => {
  console.error('Failed to seed leave accrual rules:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
