import mongoose from 'mongoose';
import { DEFAULT_LEAVE_BALANCES } from '../constants/index.js';

const documentSchema = new mongoose.Schema(
  {
    documentName: {
      type: String,
      required: true,
      trim: true,
    },
    documentType: {
      type: String,
      trim: true,
      default: 'Other',
    },
    s3Key: {
      type: String,
      required: true,
    },
    originalFileName: {
      type: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const salarySchema = new mongoose.Schema(
  {
    basicSalary: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },           // House Rent Allowance
    otherAllowances: { type: Number, default: 0 },
    taxDeduction: { type: Number, default: 0 },   // TDS / Income Tax
    pfDeduction: { type: Number, default: 0 },    // Provident Fund
    effectiveFrom: { type: Date },
  },
  { _id: false }
);

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    employeeCode: {
      type: String,
      required: [true, 'Employee code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    personalDetails: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
      },
      dateOfBirth: {
        type: Date,
      },
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      },
      address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        pincode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'India' },
      },
      emergencyContact: {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true },
      },
    },
    organization: {
      department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required'],
        index: true,
      },
      designation: {
        type: String,
        required: [true, 'Designation is required'],
        trim: true,
      },
      reportingManager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
        index: true,
      },
      joiningDate: {
        type: Date,
        required: [true, 'Joining date is required'],
      },
      employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Intern'],
        default: 'Full-Time',
      },
    },
    salary: {
      type: salarySchema,
      default: () => ({}),
    },
    documents: {
      type: [documentSchema],
      default: [],
    },
    leaveBalances: {
      casual: { type: Number, default: DEFAULT_LEAVE_BALANCES.casual },
      sick: { type: Number, default: DEFAULT_LEAVE_BALANCES.sick },
      earned: { type: Number, default: DEFAULT_LEAVE_BALANCES.earned },
    },
    avatarS3Key: {
      type: String,
      default: null,
    },
    bankDetails: {
      accountHolderName: { type: String, trim: true },
      accountNumber: { type: String, trim: true, select: false },
      bankName: { type: String, trim: true },
      ifscCode: { type: String, trim: true, uppercase: true },
      panNumber: { type: String, trim: true, uppercase: true, select: false },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Full name
employeeSchema.virtual('fullName').get(function () {
  return `${this.personalDetails.firstName} ${this.personalDetails.lastName}`;
});

// Compound index: department + isActive for directory queries
employeeSchema.index({ 'organization.department': 1, isActive: 1 });

export default mongoose.model('Employee', employeeSchema);
