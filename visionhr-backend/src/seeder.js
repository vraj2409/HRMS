// ============================================================
// VisionHR — Database Seeder
// ============================================================
// Populates the database with 5 departments, 5 HR managers,
// and 25 employees. Each user gets the password VisionHR@2026.
//
// Run with:  node src/seeder.js
// ============================================================

import 'dotenv/config';           // ← MUST be first so MONGO_URI is loaded
import mongoose from 'mongoose';

import connectDB from './config/db.js';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Department from './models/Department.js';

// ============================================================
// Configuration
// ============================================================
const DEFAULT_PASSWORD = 'VisionHR@2026';   // User pre-save hook hashes this

// ============================================================
// Seed Data — Departments
// ============================================================
const departmentsData = [
  { name: 'Engineering',  code: 'ENG', description: 'Software development and engineering' },
  { name: 'Marketing',    code: 'MKT', description: 'Brand management and marketing' },
  { name: 'Sales',        code: 'SLS', description: 'Sales and business development' },
  { name: 'Finance',      code: 'FIN', description: 'Accounting and financial planning' },
  { name: 'Operations',   code: 'OPS', description: 'Operations and supply chain' },
];

// ============================================================
// Seed Data — HR Managers (one per department)
// ============================================================
const hrData = [
  {
    firstName: 'Vraj',      lastName: 'Patel',
    email: 'vraj.patel@visionhr.com',   phone: '9123456701',
    role: 'HR',  departmentCode: 'ENG',  designation: 'HR Manager',
    joiningDate: new Date('2022-01-15'),
    salary: { basic: 35000, hra: 17500, allowances: 17500 },
  },
  {
    firstName: 'Sanvi',     lastName: 'Patel',
    email: 'sanvi.patel@visionhr.com',  phone: '9123456702',
    role: 'HR',  departmentCode: 'MKT',  designation: 'HR Manager',
    joiningDate: new Date('2022-03-01'),
    salary: { basic: 34000, hra: 17000, allowances: 17000 },
  },
  {
    firstName: 'Amit',      lastName: 'Desai',
    email: 'amit.desai@visionhr.com',   phone: '9123456703',
    role: 'HR',  departmentCode: 'SLS',  designation: 'HR Manager',
    joiningDate: new Date('2022-06-20'),
    salary: { basic: 33000, hra: 16500, allowances: 16500 },
  },
  {
    firstName: 'Neha',      lastName: 'Sharma',
    email: 'neha.sharma@visionhr.com',  phone: '9123456704',
    role: 'HR',  departmentCode: 'FIN',  designation: 'HR Manager',
    joiningDate: new Date('2022-04-10'),
    salary: { basic: 36000, hra: 18000, allowances: 18000 },
  },
  {
    firstName: 'Rohan',     lastName: 'Mehta',
    email: 'rohan.mehta@visionhr.com',  phone: '9123456705',
    role: 'HR',  departmentCode: 'OPS',  designation: 'HR Manager',
    joiningDate: new Date('2022-02-01'),
    salary: { basic: 32000, hra: 16000, allowances: 16000 },
  },
];

// ============================================================
// Seed Data — Regular Employees (5 per department = 25 total)
// ============================================================
const employeesData = [
  // ---- Engineering ----
  { firstName: 'Arjun',   lastName: 'Raghav',     email: 'arjun.r@visionhr.com',    phone: '9123456706', departmentCode: 'ENG', designation: 'Senior Developer',      joiningDate: new Date('2023-03-15'), salary: { basic: 28000, hra: 14000, allowances: 14000 } },
  { firstName: 'Priya',   lastName: 'Nair',       email: 'priya.n@visionhr.com',    phone: '9123456707', departmentCode: 'ENG', designation: 'Frontend Developer',    joiningDate: new Date('2023-06-01'), salary: { basic: 22000, hra: 11000, allowances: 11000 } },
  { firstName: 'Rahul',   lastName: 'Verma',      email: 'rahul.v@visionhr.com',    phone: '9123456708', departmentCode: 'ENG', designation: 'Backend Developer',     joiningDate: new Date('2024-01-10'), salary: { basic: 20000, hra: 10000, allowances: 10000 } },
  { firstName: 'Sneha',   lastName: 'Iyer',       email: 'sneha.i@visionhr.com',    phone: '9123456709', departmentCode: 'ENG', designation: 'QA Engineer',           joiningDate: new Date('2023-09-20'), salary: { basic: 18000, hra: 9000,  allowances: 9000  } },
  { firstName: 'Vikram',  lastName: 'Singh',      email: 'vikram.s@visionhr.com',   phone: '9123456710', departmentCode: 'ENG', designation: 'DevOps Engineer',       joiningDate: new Date('2024-02-01'), salary: { basic: 25000, hra: 12500, allowances: 12500 } },

  // ---- Marketing ----
  { firstName: 'Isha',    lastName: 'Kapoor',     email: 'isha.k@visionhr.com',     phone: '9123456711', departmentCode: 'MKT', designation: 'Content Strategist',    joiningDate: new Date('2023-05-01'), salary: { basic: 20000, hra: 10000, allowances: 10000 } },
  { firstName: 'Dhruv',   lastName: 'Joshi',      email: 'dhruv.j@visionhr.com',    phone: '9123456712', departmentCode: 'MKT', designation: 'SEO Specialist',        joiningDate: new Date('2023-07-15'), salary: { basic: 18000, hra: 9000,  allowances: 9000  } },
  { firstName: 'Meera',   lastName: 'Reddy',      email: 'meera.r@visionhr.com',    phone: '9123456713', departmentCode: 'MKT', designation: 'Brand Manager',         joiningDate: new Date('2023-02-20'), salary: { basic: 24000, hra: 12000, allowances: 12000 } },
  { firstName: 'Aditya',  lastName: 'Kulkarni',   email: 'aditya.k@visionhr.com',   phone: '9123456714', departmentCode: 'MKT', designation: 'Social Media Manager', joiningDate: new Date('2024-03-10'), salary: { basic: 19000, hra: 9500,  allowances: 9500  } },
  { firstName: 'Pooja',   lastName: 'Menon',      email: 'pooja.m@visionhr.com',    phone: '9123456715', departmentCode: 'MKT', designation: 'Graphic Designer',      joiningDate: new Date('2023-11-01'), salary: { basic: 17000, hra: 8500,  allowances: 8500  } },

  // ---- Sales ----
  { firstName: 'Nikhil',  lastName: 'Bhatt',      email: 'nikhil.b@visionhr.com',   phone: '9123456716', departmentCode: 'SLS', designation: 'Sales Executive',       joiningDate: new Date('2023-04-01'), salary: { basic: 16000, hra: 8000,  allowances: 8000  } },
  { firstName: 'Kavya',   lastName: 'Saxena',     email: 'kavya.s@visionhr.com',    phone: '9123456717', departmentCode: 'SLS', designation: 'Key Account Manager',   joiningDate: new Date('2023-01-10'), salary: { basic: 23000, hra: 11500, allowances: 11500 } },
  { firstName: 'Siddharth', lastName: 'Malhotra', email: 'siddharth.m@visionhr.com', phone: '9123456718', departmentCode: 'SLS', designation: 'Business Analyst',     joiningDate: new Date('2024-04-20'), salary: { basic: 22000, hra: 11000, allowances: 11000 } },
  { firstName: 'Tanvi',   lastName: 'Agarwal',    email: 'tanvi.a@visionhr.com',    phone: '9123456719', departmentCode: 'SLS', designation: 'Sales Coordinator',     joiningDate: new Date('2023-08-15'), salary: { basic: 15000, hra: 7500,  allowances: 7500  } },
  { firstName: 'Harsh',   lastName: 'Trivedi',    email: 'harsh.t@visionhr.com',    phone: '9123456726', departmentCode: 'SLS', designation: 'Regional Manager',      joiningDate: new Date('2022-12-01'), salary: { basic: 27000, hra: 13500, allowances: 13500 } },

  // ---- Finance ----
  { firstName: 'Ritika',  lastName: 'Bansal',     email: 'ritika.b@visionhr.com',   phone: '9123456727', departmentCode: 'FIN', designation: 'Accountant',            joiningDate: new Date('2023-06-10'), salary: { basic: 19000, hra: 9500,  allowances: 9500  } },
  { firstName: 'Gaurav',  lastName: 'Tiwari',     email: 'gaurav.t@visionhr.com',   phone: '9123456728', departmentCode: 'FIN', designation: 'Financial Analyst',     joiningDate: new Date('2023-03-20'), salary: { basic: 24000, hra: 12000, allowances: 12000 } },
  { firstName: 'Divya',   lastName: 'Chauhan',    email: 'divya.c@visionhr.com',    phone: '9123456729', departmentCode: 'FIN', designation: 'Tax Specialist',        joiningDate: new Date('2024-01-05'), salary: { basic: 22000, hra: 11000, allowances: 11000 } },
  { firstName: 'Kunal',   lastName: 'Jain',       email: 'kunal.j@visionhr.com',    phone: '9123456730', departmentCode: 'FIN', designation: 'Budget Analyst',        joiningDate: new Date('2023-10-15'), salary: { basic: 21000, hra: 10500, allowances: 10500 } },
  { firstName: 'Ankita',  lastName: 'Das',        email: 'ankita.d@visionhr.com',   phone: '9123456720', departmentCode: 'FIN', designation: 'Audit Associate',       joiningDate: new Date('2023-04-10'), salary: { basic: 20000, hra: 10000, allowances: 10000 } },

  // ---- Operations ----
  { firstName: 'Manish',  lastName: 'Pandey',     email: 'manish.p@visionhr.com',   phone: '9123456721', departmentCode: 'OPS', designation: 'Operations Executive',  joiningDate: new Date('2024-01-10'), salary: { basic: 15000, hra: 7500,  allowances: 7500  } },
  { firstName: 'Ritu',    lastName: 'Choudhury',  email: 'ritu.c@visionhr.com',     phone: '9123456722', departmentCode: 'OPS', designation: 'Supply Chain Analyst',  joiningDate: new Date('2023-08-25'), salary: { basic: 21000, hra: 10500, allowances: 10500 } },
  { firstName: 'Karthik', lastName: 'Swamy',      email: 'karthik.s@visionhr.com',  phone: '9123456723', departmentCode: 'OPS', designation: 'Facilities Manager',   joiningDate: new Date('2022-11-11'), salary: { basic: 25000, hra: 12500, allowances: 12500 } },
  { firstName: 'Sonali',  lastName: 'Bose',       email: 'sonali.b@visionhr.com',   phone: '9123456724', departmentCode: 'OPS', designation: 'Logistics Coordinator', joiningDate: new Date('2024-05-05'), salary: { basic: 17000, hra: 8500,  allowances: 8500  } },
  { firstName: 'Yash',    lastName: 'Gupta',      email: 'yash.g@visionhr.com',     phone: '9123456725', departmentCode: 'OPS', designation: 'Operations Analyst',    joiningDate: new Date('2023-03-20'), salary: { basic: 19000, hra: 9500,  allowances: 9500  } },
];

// ============================================================
// Seeder Logic
// ============================================================
async function runSeeder() {
  try {
    // 1. Connect to MongoDB
    await connectDB();
    console.log('🗄️  Database connected');

    // 2. Drop existing collections (removes data + indexes for a clean slate)
    for (const name of ['users', 'employees', 'departments']) {
      try { await mongoose.connection.db.dropCollection(name); } catch { /* may not exist yet */ }
    }
    console.log('🧹  Existing data cleared');

    // 3. Insert departments and build a lookup map { code → _id }
    const deptDocs = await Department.insertMany(departmentsData);
    const deptMap = {};
    deptDocs.forEach((d) => (deptMap[d.code] = d._id));
    console.log('🏢  Departments seeded:', Object.keys(deptMap).join(', '));

    // 4. Sequential employee code counter
    let empSeq = 0;
    const now = new Date();
    const codePrefix = `VHR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-`;

    const nextEmployeeCode = () => {
      empSeq += 1;
      return `${codePrefix}${String(empSeq).padStart(4, '0')}`;
    };

    // 5. Helper: Create a User + linked Employee in one step
    //    Password is plain-text — the User model's pre-save hook hashes it.
    const createPerson = async (person, reportingManagerId = null) => {
      const user = await User.create({
        email: person.email,
        password: DEFAULT_PASSWORD,
        role: person.role || 'Employee',
      });

      const employee = await Employee.create({
        userId: user._id,
        employeeCode: nextEmployeeCode(),
        personalDetails: {
          firstName: person.firstName,
          lastName: person.lastName,
          phone: person.phone,
          email: person.email,
        },
        organization: {
          department: deptMap[person.departmentCode],
          designation: person.designation,
          joiningDate: person.joiningDate,
          reportingManager: reportingManagerId,
        },
        salary: {
          basicSalary: person.salary.basic,
          hra: person.salary.hra,
          otherAllowances: person.salary.allowances,
          taxDeduction: 0,
          pfDeduction: 0,
          effectiveFrom: person.joiningDate,
        },
        isActive: true,
      });

      return employee;
    };

    // 6. Seed HR managers first (they have no reportingManager)
    const hrManagerMap = {};   // departmentCode → Employee._id
    for (const hr of hrData) {
      const emp = await createPerson(hr, null);
      hrManagerMap[hr.departmentCode] = emp._id;
    }
    console.log('👔  HR managers seeded:', Object.keys(hrManagerMap).length);

    // 7. Seed regular employees, assigning each to their department's HR manager
    for (const empData of employeesData) {
      const managerId = hrManagerMap[empData.departmentCode] || null;
      await createPerson(empData, managerId);
    }
    console.log('👥  Employees seeded:', employeesData.length);

    // 8. Update department heads to point at the HR managers
    for (const dept of deptDocs) {
      if (hrManagerMap[dept.code]) {
        await Department.findByIdAndUpdate(dept._id, { head: hrManagerMap[dept.code] });
      }
    }
    console.log('🔗  Department heads linked');

    console.log('\n✅ Seeder completed successfully!');
    console.log('   Total users created:', hrData.length + employeesData.length);
    console.log('   Default password: ' + DEFAULT_PASSWORD);
    console.log('\n   Sample HR login:');
    console.log('     Email:    vraj.patel@visionhr.com');
    console.log('     Password: ' + DEFAULT_PASSWORD);
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    process.exit(1);
  }
}

runSeeder();
