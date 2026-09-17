/**
 * VisionHR — Database Seeder
 * Creates a SuperAdmin account and default departments on first run.
 * Run via: npm run seed
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';
import { ROLES } from '../constants/index.js';

const SEED_DEPARTMENTS = [
  { name: 'Human Resources', code: 'HR', description: 'People operations and administration' },
  { name: 'Engineering', code: 'ENG', description: 'Software development and infrastructure' },
  { name: 'Finance', code: 'FIN', description: 'Accounts and financial management' },
  { name: 'Sales', code: 'SAL', description: 'Revenue generation and client acquisition' },
  { name: 'Operations', code: 'OPS', description: 'Business operations and logistics' },
];

const SUPER_ADMIN = {
  email: 'admin@visionhr.com',
  password: 'Admin@VisionHR2024',
  role: ROLES.SUPER_ADMIN,
};

const SUPER_ADMIN_PROFILE = {
  employeeCode: 'VHR-ADMIN-0001',
  personalDetails: {
    firstName: 'System',
    lastName: 'Administrator',
    phone: '0000000000',
  },
  organization: {
    designation: 'Super Administrator',
    joiningDate: new Date(),
  },
};

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // --- Seed Departments ---
    console.log('\n📁 Seeding departments...');
    for (const dept of SEED_DEPARTMENTS) {
      await Department.findOneAndUpdate({ code: dept.code }, dept, { upsert: true, new: true });
      console.log(`   ✓ ${dept.name} (${dept.code})`);
    }

    // --- Seed Super Admin User ---
    console.log('\n👤 Seeding Super Admin...');
    const existingAdmin = await User.findOne({ email: SUPER_ADMIN.email });
    if (existingAdmin) {
      console.log('   ℹ️  Super Admin already exists. Skipping.');
    } else {
      const hrDept = await Department.findOne({ code: 'HR' });
      const adminUser = await User.create(SUPER_ADMIN);

      await Employee.create({
        ...SUPER_ADMIN_PROFILE,
        userId: adminUser._id,
        organization: {
          ...SUPER_ADMIN_PROFILE.organization,
          department: hrDept._id,
        },
      });

      console.log(`   ✓ Super Admin created: ${SUPER_ADMIN.email}`);
      console.log(`   ✓ Password: ${SUPER_ADMIN.password}`);
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
    }

    console.log('\n🎉 Seeding complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  }
};

seed();
