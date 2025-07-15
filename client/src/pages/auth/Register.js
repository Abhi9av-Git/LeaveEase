import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaSpinner, FaUpload, FaUserGraduate, FaChalkboardTeacher, FaUserTie, FaUserShield, FaUserCog } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [userType, setUserType] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const userTypes = [
    {
      id: 'student',
      name: 'Student',
      icon: FaUserGraduate,
      description: 'Register as a student to submit leave and outpass applications'
    },
    {
      id: 'counsellor',
      name: 'Counsellor',
      icon: FaChalkboardTeacher,
      description: 'Register as a faculty counsellor to approve student applications'
    },
    {
      id: 'hod',
      name: 'HOD',
      icon: FaUserTie,
      description: 'Register as Head of Department to approve leave applications'
    },
    {
      id: 'warden',
      name: 'Warden',
      icon: FaUserShield,
      description: 'Register as a hostel warden to approve applications'
    },
    {
      id: 'joint_director',
      name: 'Joint Director',
      icon: FaUserCog,
      description: 'Register as Joint Director (only one allowed)'
    }
  ];

  const handleUserTypeSelect = (type) => {
    setUserType(type);
    setErrors({});
  };

  const renderUserTypeSelection = () => (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Choose your role
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select your role to continue with registration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <div
                key={type.id}
                onClick={() => handleUserTypeSelect(type.id)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                  userType === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-center mb-4">
                  <IconComponent className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.name}</h3>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );

  if (!userType) {
    return renderUserTypeSelection();
  }

  return <RegistrationForm userType={userType} onBack={() => setUserType('')} />;
};

const RegistrationForm = ({ userType, onBack }) => {
  const [formData, setFormData] = useState(getInitialFormData(userType));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register } = useAuth();
  const navigate = useNavigate();

  const years = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];
  const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Chemical'];

  function getInitialFormData(userType) {
    const baseData = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      mobile: '',
      profileImage: null
    };

    switch (userType) {
      case 'student':
        return {
          ...baseData,
          parentMobile: '',
          registrationNo: '',
          year: '',
          branch: '',
          hostel: '',
          flank: ''
        };
      case 'counsellor':
      case 'hod':
        return {
          ...baseData,
          department: ''
        };
      case 'warden':
        return {
          ...baseData,
          year: ''
        };
      case 'joint_director':
        return baseData;
      default:
        return baseData;
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          profileImage: 'File size must be less than 5MB'
        }));
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          profileImage: 'Please select an image file'
        }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      setErrors(prev => ({
        ...prev,
        profileImage: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Common validations
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }

    // User type specific validations
    if (userType === 'student') {
      if (!formData.parentMobile) {
        newErrors.parentMobile = 'Parent mobile number is required';
      } else if (!/^[0-9]{10}$/.test(formData.parentMobile)) {
        newErrors.parentMobile = 'Please enter a valid 10-digit mobile number';
      }

      if (!formData.registrationNo.trim()) {
        newErrors.registrationNo = 'Registration number is required';
      }

      if (!formData.year) {
        newErrors.year = 'Year of study is required';
      }

      if (!formData.branch) {
        newErrors.branch = 'Branch is required';
      }

      if (!formData.hostel.trim()) {
        newErrors.hostel = 'Hostel is required';
      }

      if (!formData.flank.trim()) {
        newErrors.flank = 'Flank is required';
      }
    } else if (userType === 'counsellor' || userType === 'hod') {
      if (!formData.department) {
        newErrors.department = 'Department is required';
      }
    } else if (userType === 'warden') {
      if (!formData.year) {
        newErrors.year = 'Year is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Convert image to base64 if selected
      let profileImageData = null;
      if (formData.profileImage) {
        const reader = new FileReader();
        profileImageData = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(formData.profileImage);
        });
      }

      const userData = {
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        profileImage: profileImageData
      };

      // Add user type specific fields
      if (userType === 'student') {
        userData.parentMobile = formData.parentMobile;
        userData.registrationNo = formData.registrationNo.trim().toUpperCase();
        userData.year = formData.year;
        userData.branch = formData.branch;
        userData.hostel = formData.hostel.trim();
        userData.flank = formData.flank.trim();
      } else if (userType === 'counsellor' || userType === 'hod') {
        userData.department = formData.department;
      } else if (userType === 'warden') {
        userData.year = formData.year;
      }

      const result = await register(userData, userType);
      console.log('Registration result:', result);
      if (result.success) {
        console.log('Registration successful, navigating to dashboard...');
        navigate('/dashboard');
      } else {
        console.log('Registration failed:', result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeDisplayName = () => {
    const typeMap = {
      'student': 'Student',
      'counsellor': 'Counsellor',
      'hod': 'HOD',
      'warden': 'Warden',
      'joint_director': 'Joint Director'
    };
    return typeMap[userType] || userType;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">L</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Register as {getUserTypeDisplayName()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
          <button
            onClick={onBack}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Choose different role
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="form-label">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="mobile" className="form-label">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  className={`form-input ${errors.mobile ? 'border-red-500' : ''}`}
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                />
                {errors.mobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                )}
              </div>

              {userType === 'student' && (
                <div>
                  <label htmlFor="parentMobile" className="form-label">
                    Parent Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="parentMobile"
                    name="parentMobile"
                    className={`form-input ${errors.parentMobile ? 'border-red-500' : ''}`}
                    placeholder="Enter parent's mobile number"
                    value={formData.parentMobile}
                    onChange={handleChange}
                  />
                  {errors.parentMobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.parentMobile}</p>
                  )}
                </div>
              )}

              {(userType === 'counsellor' || userType === 'hod') && (
                <div>
                  <label htmlFor="department" className="form-label">
                    Department *
                  </label>
                  <select
                    id="department"
                    name="department"
                    className={`form-input ${errors.department ? 'border-red-500' : ''}`}
                    value={formData.department}
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {branches.map((branch) => (
                      <option key={branch} value={branch}>
                        {branch}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department}</p>
                  )}
                </div>
              )}

              {userType === 'warden' && (
                <div>
                  <label htmlFor="year" className="form-label">
                    Year *
                  </label>
                  <select
                    id="year"
                    name="year"
                    className={`form-input ${errors.year ? 'border-red-500' : ''}`}
                    value={formData.year}
                    onChange={handleChange}
                  >
                    <option value="">Select Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {errors.year && (
                    <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                  )}
                </div>
              )}

              {userType === 'student' && (
                <>
                  <div>
                    <label htmlFor="registrationNo" className="form-label">
                      Registration Number *
                    </label>
                    <input
                      type="text"
                      id="registrationNo"
                      name="registrationNo"
                      className={`form-input ${errors.registrationNo ? 'border-red-500' : ''}`}
                      placeholder="Enter registration number"
                      value={formData.registrationNo}
                      onChange={handleChange}
                    />
                    {errors.registrationNo && (
                      <p className="mt-1 text-sm text-red-600">{errors.registrationNo}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="year" className="form-label">
                      Year of Study *
                    </label>
                    <select
                      id="year"
                      name="year"
                      className={`form-input ${errors.year ? 'border-red-500' : ''}`}
                      value={formData.year}
                      onChange={handleChange}
                    >
                      <option value="">Select Year</option>
                      {years.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="branch" className="form-label">
                      Branch *
                    </label>
                    <select
                      id="branch"
                      name="branch"
                      className={`form-input ${errors.branch ? 'border-red-500' : ''}`}
                      value={formData.branch}
                      onChange={handleChange}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((branch) => (
                        <option key={branch} value={branch}>
                          {branch}
                        </option>
                      ))}
                    </select>
                    {errors.branch && (
                      <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="hostel" className="form-label">
                      Hostel *
                    </label>
                    <input
                      type="text"
                      id="hostel"
                      name="hostel"
                      className={`form-input ${errors.hostel ? 'border-red-500' : ''}`}
                      placeholder="Enter hostel name"
                      value={formData.hostel}
                      onChange={handleChange}
                    />
                    {errors.hostel && (
                      <p className="mt-1 text-sm text-red-600">{errors.hostel}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="flank" className="form-label">
                      Flank *
                    </label>
                    <input
                      type="text"
                      id="flank"
                      name="flank"
                      className={`form-input ${errors.flank ? 'border-red-500' : ''}`}
                      placeholder="Enter flank"
                      value={formData.flank}
                      onChange={handleChange}
                    />
                    {errors.flank && (
                      <p className="mt-1 text-sm text-red-600">{errors.flank}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-6">
              <label htmlFor="profileImage" className="form-label">
                Profile Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="profileImage"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="profileImage"
                        name="profileImage"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              </div>
              {errors.profileImage && (
                <p className="mt-1 text-sm text-red-600">{errors.profileImage}</p>
              )}
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className={`form-input pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    className={`form-input pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              ) : null}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 