import mongoose from 'mongoose';
import { ATTENDANCE_STATUS } from '../constants/index.js';

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee reference is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    punchIn: {
      timestamp: {
        type: Date,
        required: [true, 'Punch-in timestamp is required'],
      },
      ipAddress: {
        type: String,
        default: '',
      },
    },
    punchOut: {
      timestamp: {
        type: Date,
        default: null,
      },
      ipAddress: {
        type: String,
        default: '',
      },
    },
    totalHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PENDING,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewRemarks: {
      type: String,
      default: '',
      trim: true,
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

// Enforce one attendance record per employee per calendar date
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Compound index for HR approval queue queries (status + date range)
attendanceSchema.index({ status: 1, date: -1 });

// Method: Calculate total hours worked
attendanceSchema.methods.computeTotalHours = function () {
  if (this.punchIn?.timestamp && this.punchOut?.timestamp) {
    const diffMs = this.punchOut.timestamp - this.punchIn.timestamp;
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
};

export default mongoose.model('Attendance', attendanceSchema);
