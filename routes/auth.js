const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const HOD = require('../models/HOD');
const Warden = require('../models/Warden');
const JointDirector = require('../models/JointDirector');
const { protect } = require('../middleware/auth');
const sendToken = require('../utils/sendToken');
const { uploadImage, deleteImage } = require('../utils/cloudinary');
const ErrorResponse = require('../utils/errorResponse');

const router = express.Router();

// @desc    Register student
// @route   POST /api/auth/register/student
// @access  Public
router.post('/register/student', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('parentMobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit parent mobile number'),
  body('registrationNo').isLength({ min: 1 }).withMessage('Registration number is required'),
  body('year').isIn(['First Year', 'Second Year', 'Third Year', 'Fourth Year']).withMessage('Invalid year'),
  body('branch').isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical']).withMessage('Invalid branch'),
  body('hostel').notEmpty().withMessage('Hostel is required'),
  body('flank').notEmpty().withMessage('Flank is required')
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
      name,
      email,
      password,
      mobile,
      parentMobile,
      registrationNo,
      year,
      branch,
      hostel,
      flank,
      profileImage
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { registrationNo }, { mobile }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email, registration number, or mobile already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      mobile,
      parentMobile,
      registrationNo,
      year,
      branch,
      hostel,
      flank,
      profileImage: profileImage || {
        public_id: '',
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      }
    });

    sendToken(user, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Register counsellor
// @route   POST /api/auth/register/counsellor
// @access  Public
router.post('/register/counsellor', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('department').isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical']).withMessage('Invalid department')
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
      name,
      email,
      password,
      mobile,
      department,
      profileImage
    } = req.body;

    // Check if counsellor already exists
    const existingCounsellor = await Counsellor.findOne({
      $or: [{ email }, { mobile }]
    });

    if (existingCounsellor) {
      return res.status(400).json({
        success: false,
        message: 'Counsellor with this email or mobile already exists'
      });
    }

    // Create counsellor
    const counsellor = await Counsellor.create({
      name,
      email,
      password,
      mobile,
      department,
      profileImage: profileImage || {
        public_id: '',
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      }
    });

    sendToken(counsellor, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Register HOD
// @route   POST /api/auth/register/hod
// @access  Public
router.post('/register/hod', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('department').isIn(['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical']).withMessage('Invalid department')
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
      name,
      email,
      password,
      mobile,
      department,
      profileImage
    } = req.body;

    // Check if HOD already exists for this department
    const existingHOD = await HOD.findOne({
      $or: [{ email }, { mobile }, { department }]
    });

    if (existingHOD) {
      return res.status(400).json({
        success: false,
        message: 'HOD with this email, mobile, or department already exists'
      });
    }

    // Create HOD
    const hod = await HOD.create({
      name,
      email,
      password,
      mobile,
      department,
      profileImage: profileImage || {
        public_id: '',
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      }
    });

    sendToken(hod, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Register warden
// @route   POST /api/auth/register/warden
// @access  Public
router.post('/register/warden', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number'),
  body('year').isIn(['First Year', 'Second Year', 'Third Year', 'Fourth Year']).withMessage('Invalid year')
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
      name,
      email,
      password,
      mobile,
      year,
      profileImage
    } = req.body;

    // Check if warden already exists for this year
    const existingWarden = await Warden.findOne({
      $or: [{ email }, { mobile }, { year }]
    });

    if (existingWarden) {
      return res.status(400).json({
        success: false,
        message: 'Warden with this email, mobile, or year already exists'
      });
    }

    // Create warden
    const warden = await Warden.create({
      name,
      email,
      password,
      mobile,
      year,
      profileImage: profileImage || {
        public_id: '',
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      }
    });

    sendToken(warden, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Register joint director
// @route   POST /api/auth/register/joint_director
// @access  Public
router.post('/register/joint_director', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').matches(/^[0-9]{10}$/).withMessage('Please enter a valid 10-digit mobile number')
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
      name,
      email,
      password,
      mobile,
      profileImage
    } = req.body;

    // Check if joint director already exists (only one allowed)
    const existingJointDirector = await JointDirector.findOne();

    if (existingJointDirector) {
      return res.status(400).json({
        success: false,
        message: 'Joint Director already exists'
      });
    }

    // Create joint director
    const jointDirector = await JointDirector.create({
      name,
      email,
      password,
      mobile,
      profileImage: profileImage || {
        public_id: '',
        url: 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
      }
    });

    sendToken(jointDirector, 201, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check if user exists in any collection
    let user = await User.findOne({ email }).select('+password');
    let userType = 'student';
    
    if (!user) {
      user = await Counsellor.findOne({ email }).select('+password');
      userType = 'counsellor';
    }
    
    if (!user) {
      user = await HOD.findOne({ email }).select('+password');
      userType = 'hod';
    }
    
    if (!user) {
      user = await Warden.findOne({ email }).select('+password');
      userType = 'warden';
    }
    
    if (!user) {
      user = await JointDirector.findOne({ email }).select('+password');
      userType = 'joint_director';
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get current user (works for all user types)
router.get('/me', protect, async (req, res, next) => {
  try {
    let user = await User.findById(req.user.id);
    let userType = 'student';

    if (!user) {
      user = await Counsellor.findById(req.user.id);
      userType = 'counsellor';
    }
    if (!user) {
      user = await HOD.findById(req.user.id);
      userType = 'hod';
    }
    if (!user) {
      user = await Warden.findById(req.user.id);
      userType = 'warden';
    }
    if (!user) {
      user = await JointDirector.findById(req.user.id);
      userType = 'joint_director';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach userType to the user object for the frontend
    user = user.toObject();
    user.userType = userType;

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/update-profile
// @access  Private
router.put('/update-profile', protect, async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      parentMobile,
      hostel,
      flank,
      profileImage
    } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) updateFields.mobile = mobile;
    if (parentMobile) updateFields.parentMobile = parentMobile;
    if (hostel) updateFields.hostel = hostel;
    if (flank) updateFields.flank = flank;

    // Handle profile image update
    if (profileImage && profileImage !== req.user.profileImage.url) {
      // Delete old image if exists
      if (req.user.profileImage.public_id) {
        await deleteImage(req.user.profileImage.public_id);
      }
      
      // Upload new image
      const imageResult = await uploadImage(profileImage, 'profiles');
      updateFields.profileImage = imageResult;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
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

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isPasswordMatched = await user.comparePassword(currentPassword);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 