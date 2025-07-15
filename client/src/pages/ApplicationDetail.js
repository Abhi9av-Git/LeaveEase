import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaUser, FaCalendar, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplication(data.application);
      } else {
        toast.error('Failed to load application details');
        navigate('/applications');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      toast.error('Failed to load application details');
      navigate('/applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action) => {
    if (!user) {
      toast.error('User not logged in.');
      return;
    }

    if (!application) {
      toast.error('Application not found.');
      return;
    }

    if (!comments) {
      toast.error('Comments are required.');
      return;
    }

    try {
      const endpoint = action === 'approve'
        ? `/api/applications/${id}/approve`
        : `/api/applications/${id}/reject`;
      const method = 'PUT';
      const body = action === 'approve'
        ? { comments }
        : { rejectionReason: comments };
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (response.ok) {
        toast.success(`Application ${action}d successfully!`);
        fetchApplication(); // Refresh application data
        setComments(''); // Clear comments after action
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || `Failed to ${action} application.`);
      }
    } catch (error) {
      console.error(`Error ${action}ing application:`, error);
      toast.error(`Failed to ${action} application.`);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'approved':
        return <FaCheckCircle className="text-green-500" />;
      case 'rejected':
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <FaFileAlt className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Application not found</h3>
        <p className="mt-1 text-sm text-gray-500">The application you're looking for doesn't exist.</p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/applications')}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <FaArrowLeft className="mr-2" />
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/applications')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Application Details
              </h1>
              <p className="text-gray-600">
                {application.applicationType?.charAt(0).toUpperCase() + application.applicationType?.slice(1)} Application
              </p>
            </div>
          </div>
          <div className="flex items-center">
            {getStatusIcon(application.status)}
            <span className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(application.status)}`}>
              {application.status?.charAt(0).toUpperCase() + application.status?.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Application Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaFileAlt className="mr-2" />
              Application Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-gray-900 capitalize">{application.applicationType}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted On</label>
                <p className="text-gray-900">{formatDateTime(application.createdAt)}</p>
              </div>

              {application.applicationType === 'outpass' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Time</label>
                    <p className="text-gray-900">{formatDateTime(application.initialTime)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Time</label>
                    <p className="text-gray-900">{formatDateTime(application.expectedReturnTime)}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Journey Date</label>
                    <p className="text-gray-900">{formatDate(application.journeyDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Return Date</label>
                    <p className="text-gray-900">{formatDate(application.returnDate)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Reason</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.reason}</p>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              Address
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{application.address}</p>
          </div>

          {/* Academic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Academic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance Percentage</label>
                <p className="text-gray-900">{application.attendance}%</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Semester SGPA</label>
                <p className="text-gray-900">{application.lastSemesterSGPA}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <FaUser className="mr-2" />
              Student Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900">{application.student?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration No</label>
                <p className="text-gray-900">{application.student?.registrationNo}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <p className="text-gray-900">{application.student?.branch}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <p className="text-gray-900">{application.student?.year}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent's Mobile</label>
                <p className="text-gray-900">{application.student?.parentMobile}</p>
              </div>
            </div>
          </div>

          {/* Approval Actions for Admins */}
          {user && user.userType !== 'student' && application.status === 'pending' && application.currentLevel === user.userType && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2" />
                Approval Action
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comments (optional)</label>
                <textarea
                  value={comments}
                  onChange={e => setComments(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Add any comments or notes..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleApproval('approve')}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleApproval('reject')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          )}

          {/* Comments */}
          {application.comments && application.comments.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>
              <div className="space-y-3">
                {application.comments.map((comment, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>{comment.approver}</strong> - {formatDateTime(comment.timestamp)}
                    </p>
                    <p className="text-gray-700">{comment.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail; 