const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Email validation fields
  counsellorEmail: {
    type: String,
    required: function() { return this.applicationType === 'outpass' || this.applicationType === 'leave'; }
  },
  hodEmail: {
    type: String,
    required: function() { return this.applicationType === 'leave'; }
  },
  wardenEmail: {
    type: String,
    required: function() { return this.applicationType === 'outpass' || this.applicationType === 'leave'; }
  },
  applicationType: {
    type: String,
    required: [true, 'Application type is required'],
    enum: ['leave', 'outpass']
  },
  // For outpass
  initialTime: {
    type: Date,
    required: function() { return this.applicationType === 'outpass'; }
  },
  expectedReturnTime: {
    type: Date,
    required: function() { return this.applicationType === 'outpass'; }
  },
  // For leave
  journeyDate: {
    type: Date,
    required: function() { return this.applicationType === 'leave'; }
  },
  returnDate: {
    type: Date,
    required: function() { return this.applicationType === 'leave'; }
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    maxlength: [500, 'Reason cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    maxlength: [200, 'Address cannot exceed 200 characters']
  },
  attendance: {
    type: Number,
    required: [true, 'Attendance percentage is required'],
    min: [0, 'Attendance cannot be negative'],
    max: [100, 'Attendance cannot exceed 100%']
  },
  lastSemesterSGPA: {
    type: Number,
    required: [true, 'Last semester SGPA is required'],
    min: [0, 'SGPA cannot be negative'],
    max: [10, 'SGPA cannot exceed 10']
  },
  status: {
    type: String,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected', 'cancelled']
  },
  currentLevel: {
    type: String,
    default: 'counsellor',
    enum: ['counsellor', 'hod', 'joint_director', 'warden', 'completed']
  },
  // Approval tracking
  counsellorApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comments: { type: String, maxlength: [200, 'Comments cannot exceed 200 characters'] }
  },
  hodApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comments: { type: String, maxlength: [200, 'Comments cannot exceed 200 characters'] }
  },
  jointDirectorApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comments: { type: String, maxlength: [200, 'Comments cannot exceed 200 characters'] }
  },
  wardenApproval: {
    approved: { type: Boolean, default: false },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    comments: { type: String, maxlength: [200, 'Comments cannot exceed 200 characters'] }
  },
  // Rejection details
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectionReason: {
    type: String,
    maxlength: [200, 'Rejection reason cannot exceed 200 characters']
  },
  // Application metadata
  submittedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
applicationSchema.index({ student: 1, status: 1 });
applicationSchema.index({ currentLevel: 1, status: 1 });
applicationSchema.index({ applicationType: 1, status: 1 });

// Virtual for application duration (for leave applications)
applicationSchema.virtual('duration').get(function() {
  if (this.applicationType === 'leave' && this.journeyDate && this.returnDate) {
    const diffTime = Math.abs(this.returnDate - this.journeyDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual for time duration (for outpass applications)
applicationSchema.virtual('timeDuration').get(function() {
  if (this.applicationType === 'outpass' && this.initialTime && this.expectedReturnTime) {
    const diffTime = Math.abs(this.expectedReturnTime - this.initialTime);
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    return diffHours;
  }
  return null;
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });
applicationSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate dates
applicationSchema.pre('save', function(next) {
  if (this.applicationType === 'outpass') {
    if (this.initialTime >= this.expectedReturnTime) {
      return next(new Error('Expected return time must be after initial time'));
    }
  } else if (this.applicationType === 'leave') {
    if (this.journeyDate >= this.returnDate) {
      return next(new Error('Return date must be after journey date'));
    }
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema); 