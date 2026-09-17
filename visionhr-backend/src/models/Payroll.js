import mongoose from 'mongoose';
import { PAYROLL_STATUS } from '../constants/index.js';

const payrollSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    // Working day computation
    totalWorkingDays: {
      type: Number,
      required: true,
    },
    payableDays: {
      type: Number,
      required: true,
    },
    approvedAttendanceDays: {
      type: Number,
      default: 0,
    },
    unpaidAbsenceDays: {
      type: Number,
      default: 0,
    },
    unpaidLeaveDays: {
      type: Number,
      default: 0,
    },
    // Earnings breakdown (monthly amounts)
    earnings: {
      basicSalary: { type: Number, default: 0 },
      hra: { type: Number, default: 0 },
      otherAllowances: { type: Number, default: 0 },
      grossEarnings: { type: Number, default: 0 },
    },
    // Deductions breakdown
    deductions: {
      taxDeduction: { type: Number, default: 0 },
      pfDeduction: { type: Number, default: 0 },
      lossOfPay: { type: Number, default: 0 },
      totalDeductions: { type: Number, default: 0 },
    },
    netSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(PAYROLL_STATUS),
      default: PAYROLL_STATUS.DRAFT,
      index: true,
    },
    payslipS3Key: {
      type: String,
      default: null,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    processedAt: {
      type: Date,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Enforce one payroll record per employee per month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
payrollSchema.index({ year: 1, month: 1, status: 1 });

export default mongoose.model('Payroll', payrollSchema);
