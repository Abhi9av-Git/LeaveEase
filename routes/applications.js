const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const User = require('../models/User');
const { protect, isStudent, isAdmin } = require('../middleware/auth');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { sendSMS, smsTemplates } = require('../utils/smsService');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Submit new application
// @route   POST /api/applications
// @access  Private (Students only)
router.post('/', protect, isStudent, [
  body('applicationType').isIn(['leave', 'outpass']).withMessage('Invalid application type'),
  body('reason').isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters'),
  body('address').isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  body('attendance').isFloat({ min: 0, max: 100 }).withMessage('Attendance must be between 0 and 100'),
  body('lastSemesterSGPA').isFloat({ min: 0, max: 10 }).withMessage('SGPA must be between 0 and 10'),
  body('counsellorEmail').isEmail().withMessage('Please enter a valid counsellor email'),
  body('wardenEmail').isEmail().withMessage('Please enter a valid warden email'),
  body('hodEmail').custom((value, { req }) => {
    if (req.body.applicationType === 'leave' && !value) {
      throw new Error('HOD email is required for leave applications');
    }
    return true;
  }),
  body('initialTime').custom((value, { req }) => {
    if (req.body.applicationType === 'outpass' && !value) {
      throw new Error('Initial time is required for outpass applications');
    }
    return true;
  }),
  body('expectedReturnTime').custom((value, { req }) => {
    if (req.body.applicationType === 'outpass' && !value) {
      throw new Error('Expected return time is required for outpass applications');
    }
    return true;
  }),
  body('journeyDate').custom((value, { req }) => {
    if (req.body.applicationType === 'leave' && !value) {
      throw new Error('Journey date is required for leave applications');
    }
    return true;
  }),
  body('returnDate').custom((value, { req }) => {
    if (req.body.applicationType === 'leave' && !value) {
      throw new Error('Return date is required for leave applications');
    }
    return true;
  })
], async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      applicationType,
      initialTime,
      expectedReturnTime,
      journeyDate,
      returnDate,
      reason,
      address,
      attendance,
      lastSemesterSGPA,
      counsellorEmail,
      hodEmail,
      wardenEmail
    } = req.body;

    // Check if student has any pending application
    const pendingApplication = await Application.findOne({
      student: req.user.id,
      status: 'pending'
    });

    if (pendingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application. Please wait for it to be processed.'
      });
    }

    // Validate counsellor email
    const Counsellor = require('../models/Counsellor');
    const counsellor = await Counsellor.findOne({ email: counsellorEmail, isActive: true });
    if (!counsellor) {
      return res.status(400).json({
        success: false,
        message: 'Invalid counsellor email. Please check and try again.'
      });
    }

    // Validate warden email
    const Warden = require('../models/Warden');
    const warden = await Warden.findOne({ email: wardenEmail, isActive: true });
    if (!warden) {
      return res.status(400).json({
        success: false,
        message: 'Invalid warden email. Please check and try again.'
      });
    }

    // Validate HOD email for leave applications
    let hod = null;
    if (applicationType === 'leave') {
      const HOD = require('../models/HOD');
      hod = await HOD.findOne({ email: hodEmail, isActive: true });
      if (!hod) {
        return res.status(400).json({
          success: false,
          message: 'Invalid HOD email. Please check and try again.'
        });
      }
    }

    // Create application data
    const applicationData = {
      student: req.user.id,
      applicationType,
      reason,
      address,
      attendance,
      lastSemesterSGPA,
      counsellorEmail,
      wardenEmail,
      currentLevel: 'counsellor' // Always starts with counsellor
    };

    // Add HOD email for leave applications
    if (applicationType === 'leave') {
      applicationData.hodEmail = hodEmail;
    }

    // Add type-specific fields
    if (applicationType === 'outpass') {
      applicationData.initialTime = new Date(initialTime);
      applicationData.expectedReturnTime = new Date(expectedReturnTime);
    } else {
      applicationData.journeyDate = new Date(journeyDate);
      applicationData.returnDate = new Date(returnDate);
    }

    // Create application
    const application = await Application.create(applicationData);

    // Populate student details
    await application.populate('student', 'name email mobile');

    // Send notifications to counsellor
    const emailTemplate = emailTemplates.newApplicationNotification(
      counsellor.name,
      application.student.name,
      applicationType
    );
    
    await sendEmail({
      email: counsellor.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    await sendSMS(
      counsellor.mobile,
      smsTemplates.newApplicationNotification(application.student.name, applicationType)
    );

    // Send notifications to warden
    const wardenEmailTemplate = emailTemplates.newApplicationNotification(
      warden.name,
      application.student.name,
      applicationType
    );
    
    await sendEmail({
      email: warden.email,
      subject: wardenEmailTemplate.subject,
      html: wardenEmailTemplate.html
    });

    await sendSMS(
      warden.mobile,
      smsTemplates.newApplicationNotification(application.student.name, applicationType)
    );

    // Send notifications to HOD for leave applications
    if (applicationType === 'leave' && hod) {
      const hodEmailTemplate = emailTemplates.newApplicationNotification(
        hod.name,
        application.student.name,
        applicationType
      );
      
      await sendEmail({
        email: hod.email,
        subject: hodEmailTemplate.subject,
        html: hodEmailTemplate.html
      });

      await sendSMS(
        hod.mobile,
        smsTemplates.newApplicationNotification(application.student.name, applicationType)
      );
    }

    // Send confirmation to student
    const studentEmailTemplate = emailTemplates.applicationSubmitted(
      application.student.name,
      applicationType
    );
    
    await sendEmail({
      email: application.student.email,
      subject: studentEmailTemplate.subject,
      html: studentEmailTemplate.html
    });

    await sendSMS(
      application.student.mobile,
      smsTemplates.applicationSubmitted(applicationType)
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user's applications
// @route   GET /api/applications
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // If user is student, show only their applications
    if (req.user.userType === 'student') {
      query.student = req.user.id;
    } else {
      // If admin, show applications at their level
      query.currentLevel = req.user.userType;
      query.status = 'pending';
    }

    const applications = await Application.find(query)
      .populate('student', 'name email mobile registrationNo year branch hostel flank profileImage')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Application.countDocuments(query);

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      applications
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email mobile parentMobile registrationNo year branch hostel flank profileImage')
      .populate('counsellorApproval.approvedBy', 'name')
      .populate('hodApproval.approvedBy', 'name')
      .populate('jointDirectorApproval.approvedBy', 'name')
      .populate('wardenApproval.approvedBy', 'name')
      .populate('rejectedBy', 'name');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user has access to this application
    if (req.user.userType === 'student' && application.student._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Approve application
// @route   PUT /api/applications/:id/approve
// @access  Private (Admins only)
router.put('/:id/approve', protect, isAdmin, [
  body('comments').optional().isLength({ max: 200 }).withMessage('Comments cannot exceed 200 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { comments } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email mobile');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application is at the correct level for this admin
    if (application.currentLevel !== req.user.userType) {
      return res.status(403).json({
        success: false,
        message: `Application is not at ${req.user.userType} level`
      });
    }

    // Update approval status based on admin user type
    const approvalField = `${req.user.userType}Approval`;
    application[approvalField] = {
      approved: true,
      approvedBy: req.user.id,
      approvedAt: Date.now(),
      comments: comments || ''
    };

    // Determine next level based on application type and current level
    if (application.applicationType === 'outpass') {
      // Outpass flow: counsellor → warden
      if (application.currentLevel === 'counsellor') {
        application.currentLevel = 'warden';
      } else if (application.currentLevel === 'warden') {
        application.currentLevel = 'completed';
        application.status = 'approved';
      }
    } else if (application.applicationType === 'leave') {
      // Leave flow: counsellor → hod → joint_director → warden
      if (application.currentLevel === 'counsellor') {
        application.currentLevel = 'hod';
      } else if (application.currentLevel === 'hod') {
        application.currentLevel = 'joint_director';
      } else if (application.currentLevel === 'joint_director') {
        application.currentLevel = 'warden';
      } else if (application.currentLevel === 'warden') {
        application.currentLevel = 'completed';
        application.status = 'approved';
      }
    }

    await application.save();

    // Send notifications
    if (application.status === 'approved') {
      // Final approval - notify student
      const emailTemplate = emailTemplates.applicationApproved(
        application.student.name,
        application.applicationType,
        req.user.name,
        comments
      );
      
      await sendEmail({
        email: application.student.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html
      });

      await sendSMS(
        application.student.mobile,
        smsTemplates.applicationApproved(application.applicationType, req.user.name)
      );
    } else {
      // Forward to next level - notify next admin
      let nextAdmins = [];
      
      // Find next admin based on current level
      switch (application.currentLevel) {
        case 'counsellor':
          if (application.applicationType === 'outpass') {
            // For outpass, notify wardens
            const Warden = require('../models/Warden');
            nextAdmins = await Warden.find({ isActive: true });
          } else {
            // For leave, notify HODs
            const HOD = require('../models/HOD');
            nextAdmins = await HOD.find({ isActive: true });
          }
          break;
        case 'hod':
          // Notify Joint Directors
          const JointDirector = require('../models/JointDirector');
          nextAdmins = await JointDirector.find({ isActive: true });
          break;
        case 'joint_director':
          // Notify Wardens
          const Warden = require('../models/Warden');
          nextAdmins = await Warden.find({ isActive: true });
          break;
        case 'warden':
          // No next level, application is complete
          break;
      }

      for (const admin of nextAdmins) {
        const emailTemplate = emailTemplates.newApplicationNotification(
          admin.name,
          application.student.name,
          application.applicationType
        );
        
        await sendEmail({
          email: admin.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });

        await sendSMS(
          admin.mobile,
          smsTemplates.newApplicationNotification(application.student.name, application.applicationType)
        );
      }
    }

    res.status(200).json({
      success: true,
      message: 'Application approved successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Reject application
// @route   PUT /api/applications/:id/reject
// @access  Private (Admins only)
router.put('/:id/reject', protect, isAdmin, [
  body('rejectionReason').isLength({ min: 5, max: 200 }).withMessage('Rejection reason must be between 5 and 200 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rejectionReason } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('student', 'name email mobile');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application is at the correct level for this admin
    if (application.currentLevel !== req.user.userType) {
      return res.status(403).json({
        success: false,
        message: `Application is not at ${req.user.userType} level`
      });
    }

    // Update rejection details
    application.status = 'rejected';
    application.rejectedBy = req.user.id;
    application.rejectedAt = Date.now();
    application.rejectionReason = rejectionReason;

    await application.save();

    // Send rejection notification to student
    const emailTemplate = emailTemplates.applicationRejected(
      application.student.name,
      application.applicationType,
      req.user.name,
      rejectionReason
    );
    
    await sendEmail({
      email: application.student.email,
      subject: emailTemplate.subject,
      html: emailTemplate.html
    });

    await sendSMS(
      application.student.mobile,
      smsTemplates.applicationRejected(application.applicationType, req.user.name)
    );

    res.status(200).json({
      success: true,
      message: 'Application rejected successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Cancel application (student only)
// @route   PUT /api/applications/:id/cancel
// @access  Private (Students only)
router.put('/:id/cancel', protect, isStudent, async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application belongs to the student
    if (application.student.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if application can be cancelled (only if pending)
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be cancelled at this stage'
      });
    }

    application.status = 'cancelled';
    await application.save();

    res.status(200).json({
      success: true,
      message: 'Application cancelled successfully',
      application
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 