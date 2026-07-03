require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');
const { ROLES } = require('../utils/roles');

async function seedSuperAdmin() {
  await connectDB();

  const loginId = process.env.SEED_SUPER_ADMIN_LOGIN || 'superadmin';
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';

  const existing = await User.findOne({ loginId, companyId: null });

  if (existing) {
    console.log(`Super Admin already exists: ${loginId}`);
    process.exit(0);
  }

  const passwordHash = await User.hashPassword(password);

  await User.create({
    loginId,
    passwordHash,
    roles: [ROLES.SUPER_ADMIN],
    companyId: null,
    status: 'Active',
  });

  console.log('Super Admin created successfully');
  console.log(`Login ID: ${loginId}`);
  console.log(`Password: ${password}`);
  process.exit(0);
}

seedSuperAdmin().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
