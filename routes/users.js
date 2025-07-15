const express = require('express');
const User = require('../models/User');
const Application = require('../models/Application');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
router.get('/profile/:id', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has access to this profile
    if (req.user.role === 'student' && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user applications
// @route   GET /api/users/:id/applications
// @access  Private
router.get('/:id/applications', protect, async (req, res, next) => {
  try {
    // Check if user has access to these applications
    if (req.user.role === 'student' && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const applications = await Application.find({ student: req.params.id })
      .populate('counsellorApproval.approvedBy', 'name')
      .populate('hodApproval.approvedBy', 'name')
      .populate('jointDirectorApproval.approvedBy', 'name')
      .populate('wardenApproval.approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await Application.countDocuments({ student: req.params.id });

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

// @desc    Update user profile (admin only)
// @route   PUT /api/users/:id
// @access  Private (Admins only)
router.put('/:id', protect, authorize('counsellor', 'hod', 'joint_director', 'warden'), async (req, res, next) => {
  try {
    const {
      name,
      mobile,
      parentMobile,
      hostel,
      flank,
      isActive
    } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (mobile) updateFields.mobile = mobile;
    if (parentMobile) updateFields.parentMobile = parentMobile;
    if (hostel) updateFields.hostel = hostel;
    if (flank) updateFields.flank = flank;
    if (typeof isActive === 'boolean') updateFields.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateFields,
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get users by role
// @route   GET /api/users/role/:role
// @access  Private (Admins only)
router.get('/role/:role', protect, authorize('counsellor', 'hod', 'joint_director', 'warden'), async (req, res, next) => {
  try {
    const { role } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const users = await User.find({ role, isActive: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments({ role, isActive: true });

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Search users
// @route   GET /api/users/search
// @access  Private (Admins only)
router.get('/search', protect, authorize('counsellor', 'hod', 'joint_director', 'warden'), async (req, res, next) => {
  try {
    const { q, role, branch, year } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Search by name, email, or registration number
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { registrationNo: { $regex: q, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by branch (for students)
    if (branch) {
      query.branch = branch;
    }

    // Filter by year (for students)
    if (year) {
      query.year = year;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      users
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user statistics
// @route   GET /api/users/:id/statistics
// @access  Private
router.get('/:id/statistics', protect, async (req, res, next) => {
  try {
    // Check if user has access to these statistics
    if (req.user.role === 'student' && req.params.id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const applications = await Application.find({ student: req.params.id });

    // Calculate statistics
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;
    const cancelledApplications = applications.filter(app => app.status === 'cancelled').length;

    // Applications by type
    const leaveApplications = applications.filter(app => app.applicationType === 'leave').length;
    const outpassApplications = applications.filter(app => app.applicationType === 'outpass').length;

    // Monthly statistics for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthApplications = applications.filter(app => {
        const appDate = new Date(app.createdAt);
        return appDate.getFullYear() === currentYear && appDate.getMonth() === i;
      });
      
      return {
        month: i + 1,
        count: monthApplications.length,
        approved: monthApplications.filter(app => app.status === 'approved').length,
        rejected: monthApplications.filter(app => app.status === 'rejected').length
      };
    });

    res.status(200).json({
      success: true,
      statistics: {
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        cancelledApplications,
        leaveApplications,
        outpassApplications,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 