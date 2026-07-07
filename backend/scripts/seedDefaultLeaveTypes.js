/**
 * Seed default leave types for a tenant (Sheet 04 — Master Data Setup, Task 1).
 *
 * Usage:
 *   node scripts/seedDefaultLeaveTypes.js ABCD1234
 *   npm run seed:leave-types -- ABCD1234
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const LeaveType = require('../models/LeaveType');

const DEFAULT_LEAVE_TYPES = [
  {
    code: 'CL',
    name: 'Casual Leave',
    description: 'Short-notice personal leave',
    annualEntitlement: 12,
    allowsHalfDay: true,
    isEncashable: false,
    allowsCarryForward: false,
    maxCarryForwardDays: 0,
    applySandwichRule: false,
    requiresHrApproval: false,
    isActive: true,
  },
  {
    code: 'SL',
    name: 'Sick Leave',
    description: 'Medical or health-related leave',
    annualEntitlement: 12,
    allowsHalfDay: true,
    isEncashable: false,
    allowsCarryForward: false,
    maxCarryForwardDays: 0,
    applySandwichRule: false,
    requiresHrApproval: false,
    isActive: true,
  },
  {
    code: 'EL',
    name: 'Earned Leave',
    description: 'Accrued earned leave with carry-forward and encashment',
    annualEntitlement: 30,
    allowsHalfDay: true,
    isEncashable: true,
    allowsCarryForward: true,
    maxCarryForwardDays: 15,
    applySandwichRule: true,
    requiresHrApproval: true,
    isActive: true,
  },
  {
    code: 'SPL',
    name: 'Special Leave',
    description: 'Special approval leave for exceptional cases',
    annualEntitlement: 5,
    allowsHalfDay: false,
    isEncashable: false,
    allowsCarryForward: false,
    maxCarryForwardDays: 0,
    applySandwichRule: false,
    requiresHrApproval: true,
    isActive: true,
  },
];

async function seedDefaultLeaveTypes() {
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

  for (const leaveType of DEFAULT_LEAVE_TYPES) {
    await LeaveType.forTenant(company._id).updateOne(
      { code: leaveType.code },
      { $set: leaveType },
      { upsert: true }
    );
  }

  const leaveTypes = await LeaveType.forTenant(company._id).find().sort({ code: 1 }).lean();

  console.log(`Default leave types seeded for ${company.name} (${company.code}):`);
  leaveTypes.forEach((leaveType) => {
    console.log(
      `- ${leaveType.code} | ${leaveType.name} | entitlement=${leaveType.annualEntitlement} | ${leaveType._id}`
    );
  });

  await mongoose.disconnect();
  process.exit(0);
}

seedDefaultLeaveTypes().catch(async (error) => {
  console.error('Failed to seed default leave types:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
