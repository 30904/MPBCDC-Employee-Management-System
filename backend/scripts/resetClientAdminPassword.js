/**
 * Reset CLIENT_ADMIN password for a tenant (local dev helper).
 *
 * Usage:
 *   node scripts/resetClientAdminPassword.js ABCD1234
 *   npm run seed:client-admin -- ABCD1234
 *
 * Default password: ClientAdmin@123
 */
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const { ROLES } = require('../utils/roles');

const DEFAULT_PASSWORD = process.env.SEED_CLIENT_ADMIN_PASSWORD || 'ClientAdmin@123';

async function main() {
  const companyCode = String(process.argv[2] || 'ABCD1234').trim().toUpperCase();

  await connectDB();

  const company = await Company.findOne({ code: companyCode, status: 'Active' });
  if (!company) {
    console.error(`Company not found or inactive: ${companyCode}`);
    process.exit(1);
  }

  let user = await User.findOne({
    loginId: 'client.admin',
    companyId: company._id,
  }).select('+passwordHash');

  const passwordHash = await User.hashPassword(DEFAULT_PASSWORD);

  if (!user) {
    user = await User.forTenant(company._id).create({
      loginId: 'client.admin',
      passwordHash,
      roles: [ROLES.CLIENT_ADMIN],
      status: 'Active',
    });
    console.log(`Created client.admin for ${company.name} (${company.code})`);
  } else {
    user.passwordHash = passwordHash;
    user.status = 'Active';
    await user.save();
    console.log(`Reset password for client.admin on ${company.name} (${company.code})`);
  }

  console.log(`Login ID: client.admin`);
  console.log(`Company code: ${company.code}`);
  console.log(`Password: ${DEFAULT_PASSWORD}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
