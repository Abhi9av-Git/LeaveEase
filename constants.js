// Database Configuration
const DB_NAME = "leave_management_system";
const DB_HOST = "localhost";
const DB_PORT = 27017;
const DB_URI = `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`;
// MongoDB Atlas Configuration
const MONGODB_ATLAS_URI = process.env.MONGODB_ATLAS_URI || `mongodb+srv://username:password@cluster.mongodb.net/${DB_NAME}`;
const COLLECTIONS = {
  USERS: "user",
  APPLICATIONS: "applications"
};

// Application Configuration
const APP_NAME = "VideoTube";
const APP_VERSION = "1.0.0";
const APP_DESCRIPTION = "A comprehensive digital platform for managing student leave and outpass applications in colleges";

// Server Configuration
const SERVER_PORT = 5000;
const SERVER_HOST = "localhost";
const SERVER_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;

// Frontend Configuration
const FRONTEND_PORT = 3000;
const FRONTEND_HOST = "localhost";
const FRONTEND_URL = `http://${FRONTEND_HOST}:${FRONTEND_PORT}`;

// JWT Configuration
const JWT_SECRET = "your_jwt_secret_key_here";
const JWT_EXPIRE = "7d";
const JWT_COOKIE_EXPIRE = 7;

// File Upload Configuration
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const CLOUDINARY_FOLDER = "leave-management";

// Application Types
const APPLICATION_TYPES = {
  LEAVE: "leave",
  OUTPASS: "outpass"
};

// User Roles
const USER_ROLES = {
  STUDENT: "student",
  COUNSELLOR: "counsellor",
  HOD: "hod",
  JOINT_DIRECTOR: "joint_director",
  WARDEN: "warden"
};

// Application Status
const APPLICATION_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CANCELLED: "cancelled"
};

// Approval Levels
const APPROVAL_LEVELS = {
  COUNSELLOR: "counsellor",
  HOD: "hod",
  JOINT_DIRECTOR: "joint_director",
  WARDEN: "warden",
  COMPLETED: "completed"
};

// Academic Years
const ACADEMIC_YEARS = [
  "First Year",
  "Second Year", 
  "Third Year",
  "Fourth Year"
];

// Branches
const BRANCHES = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
  "Chemical"
];

// Pagination
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

// Validation Rules
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  MOBILE_LENGTH: 10,
  REASON_MIN_LENGTH: 10,
  REASON_MAX_LENGTH: 500,
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 200,
  COMMENTS_MAX_LENGTH: 200,
  ATTENDANCE_MIN: 0,
  ATTENDANCE_MAX: 100,
  SGPA_MIN: 0,
  SGPA_MAX: 10
};

// Email Templates
const EMAIL_TEMPLATES = {
  APPLICATION_SUBMITTED: "applicationSubmitted",
  APPLICATION_APPROVED: "applicationApproved",
  APPLICATION_REJECTED: "applicationRejected",
  NEW_APPLICATION_NOTIFICATION: "newApplicationNotification"
};

// SMS Templates
const SMS_TEMPLATES = {
  APPLICATION_SUBMITTED: "applicationSubmitted",
  APPLICATION_APPROVED: "applicationApproved",
  APPLICATION_REJECTED: "applicationRejected",
  NEW_APPLICATION_NOTIFICATION: "newApplicationNotification"
};

// API Endpoints
const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    UPDATE_PROFILE: "/api/auth/update-profile",
    CHANGE_PASSWORD: "/api/auth/change-password"
  },
  APPLICATIONS: {
    CREATE: "/api/applications",
    GET_ALL: "/api/applications",
    GET_BY_ID: "/api/applications/:id",
    APPROVE: "/api/applications/:id/approve",
    REJECT: "/api/applications/:id/reject",
    CANCEL: "/api/applications/:id/cancel"
  },
  ADMIN: {
    DASHBOARD: "/api/admin/dashboard",
    APPLICATIONS: "/api/admin/applications",
    STUDENTS: "/api/admin/students",
    STATISTICS: "/api/admin/statistics",
    PROFILE: "/api/admin/profile"
  },
  USERS: {
    PROFILE: "/api/users/profile/:id",
    APPLICATIONS: "/api/users/:id/applications",
    UPDATE: "/api/users/:id",
    BY_ROLE: "/api/users/role/:role",
    SEARCH: "/api/users/search",
    STATISTICS: "/api/users/:id/statistics"
  }
};

// Error Messages
const ERROR_MESSAGES = {
  UNAUTHORIZED: "Not authorized to access this route",
  FORBIDDEN: "Access denied",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Validation failed",
  DUPLICATE_ENTRY: "Duplicate field value entered",
  INVALID_TOKEN: "Token is not valid",
  TOKEN_EXPIRED: "Token expired",
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "User not found",
  APPLICATION_NOT_FOUND: "Application not found",
  FILE_TOO_LARGE: "File size must be less than 5MB",
  INVALID_FILE_TYPE: "Please select an image file",
  INVALID_MOBILE: "Please enter a valid 10-digit mobile number",
  INVALID_EMAIL: "Please enter a valid email",
  PASSWORD_MISMATCH: "Passwords do not match",
  INVALID_ATTENDANCE: "Attendance must be between 0 and 100",
  INVALID_SGPA: "SGPA must be between 0 and 10"
};

// Success Messages
const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: "Registration successful!",
  LOGIN_SUCCESS: "Login successful!",
  LOGOUT_SUCCESS: "Logged out successfully",
  PROFILE_UPDATED: "Profile updated successfully!",
  PASSWORD_CHANGED: "Password changed successfully!",
  APPLICATION_SUBMITTED: "Application submitted successfully",
  APPLICATION_APPROVED: "Application approved successfully",
  APPLICATION_REJECTED: "Application rejected successfully",
  APPLICATION_CANCELLED: "Application cancelled successfully",
  USER_UPDATED: "User updated successfully"
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

// Date Formats
const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  DATETIME: "DD/MM/YYYY HH:mm",
  API: "YYYY-MM-DD",
  API_DATETIME: "YYYY-MM-DDTHH:mm:ss.SSSZ"
};

// Time Constants
const TIME_CONSTANTS = {
  OUTPASS_DEADLINE_HOUR: 21, // 9 PM
  DAY_IN_MS: 24 * 60 * 60 * 1000,
  HOUR_IN_MS: 60 * 60 * 1000,
  MINUTE_IN_MS: 60 * 1000
};

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
  FOLDER: "leave-management",
  PROFILE_FOLDER: "profiles",
  TRANSFORMATIONS: {
    PROFILE: {
      width: 300,
      height: 300,
      crop: "fill",
      gravity: "face"
    },
    THUMBNAIL: {
      width: 150,
      height: 150,
      crop: "fill"
    }
  }
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100 // requests per window
};

// Security
const SECURITY = {
  PASSWORD_SALT_ROUNDS: 12,
  TOKEN_EXPIRY_DAYS: 7,
  COOKIE_SECURE: false, // Set to true in production
  COOKIE_SAME_SITE: "strict"
};

// Export all constants
module.exports = {
  DB_NAME,
  DB_HOST,
  DB_PORT,
  DB_URI,
  MONGODB_ATLAS_URI,
  COLLECTIONS,
  APP_NAME,
  APP_VERSION,
  APP_DESCRIPTION,
  SERVER_PORT,
  SERVER_HOST,
  SERVER_URL,
  FRONTEND_PORT,
  FRONTEND_HOST,
  FRONTEND_URL,
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_COOKIE_EXPIRE,
  MAX_FILE_SIZE,
  ALLOWED_FILE_TYPES,
  CLOUDINARY_FOLDER,
  APPLICATION_TYPES,
  USER_ROLES,
  APPLICATION_STATUS,
  APPROVAL_LEVELS,
  ACADEMIC_YEARS,
  BRANCHES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  VALIDATION_RULES,
  EMAIL_TEMPLATES,
  SMS_TEMPLATES,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  DATE_FORMATS,
  TIME_CONSTANTS,
  CLOUDINARY_CONFIG,
  RATE_LIMIT,
  SECURITY
}; 