require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Role = require('../models/Role');

const DEFAULT_ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Highest privilege system role',
    status: 'Active',
    companyId: null,
    isGlobal: true,
  },
  {
    code: 'CLIENT_ADMIN',
    name: 'Admin',
    description: 'Company administrator with full access to the client portal',
    status: 'Active',
    companyId: null,
    isGlobal: true,
  },
  {
    code: 'EMPLOYEE',
    name: 'Employee',
    description: 'Default employee role',
    status: 'Active',
    companyId: null,
    isGlobal: true,
  },
];

async function seedDefaultRoles() {
  await connectDB();

  for (const role of DEFAULT_ROLES) {
    await Role.updateOne(
      { code: role.code, companyId: null },
      {
        $set: {
          name: role.name,
          description: role.description,
          status: role.status,
          isGlobal: role.isGlobal,
        },
        $setOnInsert: {
          companyId: null,
        },
      },
      { upsert: true }
    );
  }

  const roles = await Role.find({ companyId: null }).sort({ code: 1 }).lean();
  console.log('Default global roles are ready:');
  roles.forEach((role) => {
    console.log(`- ${role.code} | ${role.name} | ${role._id}`);
  });

  await mongoose.disconnect();
  process.exit(0);
}

seedDefaultRoles().catch(async (error) => {
  console.error('Failed to seed default roles:', error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
