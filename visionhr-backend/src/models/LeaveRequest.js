import mongoose from 'mongoose';
import { LEAVE_TYPES, LEAVE_STATUS } from '../constants/index.js';

const leaveRequestSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    leaveType: {
      type: String,
      enum: Object.values(LEAVE_TYPES),
      required: [true, 'Leave type is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalDays: {
      type: Number,
      required: true,
      min: [0.5, 'Minimum leave duration is half a day'],
    },
    isHalfDay: {
      type: Boolean,
      default: false,
    },
    reason: {
      type: String,
      required: [true, 'Reason is required'],
      trim: true,
      minlength: [10, 'Reason must be at least 10 characters'],
    },
    workDelegation: {
      type: String,
      trim: true,
      default: '',
    },
    attachmentS3Key: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: employee + date range for overlap checks
leaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });

// Compound index: status + employee for dashboard queries
leaveRequestSchema.index({ status: 1, employee: 1 });

export default mongoose.model('LeaveRequest', leaveRequestSchema);
