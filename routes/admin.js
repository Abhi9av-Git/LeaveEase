const express = require('express');
const Application = require('../models/Application');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const HOD = require('../models/HOD');
const Warden = require('../models/Warden');
const JointDirector = require('../models/JointDirector');
const { protect, isAdmin } = require('../middleware/auth');

const router = express.Router();

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admins only)
router.get('/dashboard', protect, isAdmin, async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get statistics based on admin user type
    let query = {};
    if (req.user.userType !== 'warden') {
      query.currentLevel = req.user.userType;
    }

    // Total pending applications
    const pendingApplications = await Application.countDocuments({
      ...query,
      status: 'pending'
    });

    // Today's applications
    const todayApplications = await Application.countDocuments({
      ...query,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    // This week's applications
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weekApplications = await Application.countDocuments({
      ...query,
      createdAt: { $gte: startOfWeek }
    });

    // This month's applications
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthApplications = await Application.countDocuments({
      ...query,
      createdAt: { $gte: startOfMonth }
    });

    // Applications by type
    const leaveApplications = await Application.countDocuments({
      ...query,
      applicationType: 'leave'
    });

    const outpassApplications = await Application.countDocuments({
      ...query,
      applicationType: 'outpass'
    });

    // Recent applications (last 5)
    const recentApplications = await Application.find(query)
      .populate('student', 'name registrationNo branch')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        pendingApplications,
        todayApplications,
        weekApplications,
        monthApplications,
        leaveApplications,
        outpassApplications,
        recentApplications
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all applications for admin
// @route   GET /api/admin/applications
// @access  Private (Admins only)
router.get('/applications', protect, isAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by application type
    if (req.query.applicationType) {
      query.applicationType = req.query.applicationType;
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Filter by current level (for non-warden admins)
    if (req.user.userType !== 'warden') {
      query.currentLevel = req.user.userType;
    }

    const applications = await Application.find(query)
      .populate('student', 'name email mobile registrationNo year branch hostel flank profileImage')
      .populate('counsellorApproval.approvedBy', 'name')
      .populate('hodApproval.approvedBy', 'name')
      .populate('jointDirectorApproval.approvedBy', 'name')
      .populate('wardenApproval.approvedBy', 'name')
      .populate('rejectedBy', 'name')
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

// @desc    Get all students
// @route   GET /api/admin/students
// @access  Private (Admins only)
router.get('/students', protect, isAdmin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    let query = { userType: 'student' };

    // Filter by year
    if (req.query.year) {
      query.year = req.query.year;
    }

    // Filter by branch
    if (req.query.branch) {
      query.branch = req.query.branch;
    }

    // Filter by hostel
    if (req.query.hostel) {
      query.hostel = req.query.hostel;
    }

    // Search by name or registration number
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { registrationNo: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      students
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get student details with applications
// @route   GET /api/admin/students/:id
// @access  Private (Admins only)
router.get('/students/:id', protect, isAdmin, async (req, res, next) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get student's applications
    const applications = await Application.find({ student: req.params.id })
      .populate('counsellorApproval.approvedBy', 'name')
      .populate('hodApproval.approvedBy', 'name')
      .populate('jointDirectorApproval.approvedBy', 'name')
      .populate('wardenApproval.approvedBy', 'name')
      .populate('rejectedBy', 'name')
      .sort({ createdAt: -1 });

    // Calculate statistics
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const rejectedApplications = applications.filter(app => app.status === 'rejected').length;
    const pendingApplications = applications.filter(app => app.status === 'pending').length;

    res.status(200).json({
      success: true,
      student,
      applications,
      statistics: {
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get application statistics
// @route   GET /api/admin/statistics
// @access  Private (Admins only)
router.get('/statistics', protect, isAdmin, async (req, res, next) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    let query = {};
    if (req.user.role !== 'warden') {
      query.currentLevel = req.user.role;
    }

    // Monthly statistics
    const monthlyStats = await Application.aggregate([
      { $match: { ...query, createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Application type statistics
    const typeStats = await Application.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$applicationType',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Branch statistics
    const branchStats = await Application.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      { $unwind: '$studentInfo' },
      {
        $group: {
          _id: '$studentInfo.branch',
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthlyStats,
        typeStats,
        branchStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Private (Admins only)
router.get('/profile', protect, isAdmin, async (req, res, next) => {
  try {
    const admin = await User.findById(req.user.id).select('-password');
    
    // Get admin's approval statistics
    const approvalStats = await Application.aggregate([
      {
        $match: {
          [`${req.user.role}Approval.approvedBy`]: req.user.id
        }
      },
      {
        $group: {
          _id: null,
          totalApproved: { $sum: 1 },
          totalRejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      admin,
      approvalStats: approvalStats[0] || { totalApproved: 0, totalRejected: 0 }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 