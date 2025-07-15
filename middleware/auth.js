const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Counsellor = require('../models/Counsellor');
const HOD = require('../models/HOD');
const Warden = require('../models/Warden');
const JointDirector = require('../models/JointDirector');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in cookies or headers
    if (req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from appropriate collection based on userType
      let user = null;
      
      switch (decoded.userType) {
        case 'student':
          user = await User.findById(decoded.id).select('-password');
          break;
        case 'counsellor':
          user = await Counsellor.findById(decoded.id).select('-password');
          break;
        case 'hod':
          user = await HOD.findById(decoded.id).select('-password');
          break;
        case 'warden':
          user = await Warden.findById(decoded.id).select('-password');
          break;
        case 'joint_director':
          user = await JointDirector.findById(decoded.id).select('-password');
          break;
        default:
          return res.status(401).json({
            success: false,
            message: 'Invalid user type'
          });
      }
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Authorize user types
exports.authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: `User type ${req.user.userType} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check if user is admin (any admin user type)
exports.isAdmin = (req, res, next) => {
  const adminUserTypes = ['counsellor', 'hod', 'joint_director', 'warden'];
  if (!adminUserTypes.includes(req.user.userType)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Check if user is student
exports.isStudent = (req, res, next) => {
  if (req.user.userType !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Student privileges required.'
    });
  }
  next();
};

// Check if user can approve at current level
exports.canApproveAtLevel = (req, res, next) => {
  const { currentLevel } = req.body;
  
  const userTypeHierarchy = {
    'counsellor': ['counsellor'],
    'hod': ['counsellor', 'hod'],
    'joint_director': ['counsellor', 'hod', 'joint_director'],
    'warden': ['counsellor', 'hod', 'joint_director', 'warden']
  };

  if (!userTypeHierarchy[req.user.userType] || !userTypeHierarchy[req.user.userType].includes(currentLevel)) {
    return res.status(403).json({
      success: false,
      message: `You are not authorized to approve applications at ${currentLevel} level`
    });
  }
  
  next();
}; 