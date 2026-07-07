/**
 * Seed default national holidays for a tenant (Sheet 04 — Master Data Setup, Task 2).
 *
 * Usage:
 *   node scripts/seedDefaultHolidays.js QWER1234
 *   npm run seed:holidays -- QWER1234
 */
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Company = require('../models/Company');
const Holiday = require('../models/Holiday');
const { startOfUtcDay } = require('../utils/dateUtils');

const DEFAULT_HOLIDAYS_2026 = [
  {
    name: 'Republic Day',
    date: '2026-01-26',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Holi',
    date: '2026-03-03',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Ambedkar Jayanti',
    date: '2026-04-14',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Independence Day',
    date: '2026-08-15',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Gandhi Jayanti',
    date: '2026-10-02',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Diwali',
    date: '2026-11-08',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
  {
    name: 'Christmas',
    date: '2026-12-25',
    holidayType: 'NATIONAL',
    description: 'National holiday',
  },
];

async function seedDefaultHolidays() {
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

  for (const holiday of DEFAULT_HOLIDAYS_2026) {
    const date = startOfUtcDay(holiday.date);

    await Holiday.forTenant(company._id).updateOne(
      {
        date,
        regionId: null,
        holidayType: holiday.holidayType,
        name: holiday.name,
      },
      {
        $set: {
          name: holiday.name,
          date,
          holidayType: holiday.holidayType,
          regionId: null,
          description: holiday.description,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }

  const holidays = await Holiday.forTenant(company._id)
    .find({ date: { $gte: new Date(Date.UTC(2026, 0, 1)), $lte: new Date(Date.UTC(2026, 11, 31, 23, 59, 59, 999)) } })
    .sort({ date: 1 })
    .lean();

  console.log(`Default holidays seeded for ${company.name} (${company.code}):`);
  holidays.forEach((holiday) => {
    const date = holiday.date.toISOString().slice(0, 10);
    console.log(`- ${date} | ${holiday.holidayType} | ${holiday.name} | ${holiday._id}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

seedDefaultHolidays().catch(async (error) => {
  console.error('Failed to seed default holidays:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
