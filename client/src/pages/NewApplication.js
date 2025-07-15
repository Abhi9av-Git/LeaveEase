import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaFileAlt, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const NewApplication = () => {
  const navigate = useNavigate();
  const { type } = useParams(); // Get application type from URL
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    applicationType: type || 'leave', // Set default based on URL parameter
    initialTime: '',
    expectedReturnTime: '',
    journeyDate: '',
    returnDate: '',
    reason: '',
    address: '',
    attendance: '',
    lastSemesterSGPA: '',
    counsellorEmail: '',
    hodEmail: '',
    wardenEmail: ''
  });

  // Update application type when URL parameter changes
  useEffect(() => {
    if (type && ['leave', 'outpass'].includes(type)) {
      setFormData(prev => ({
        ...prev,
        applicationType: type
      }));
    }
  }, [type]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Application submitted successfully!');
        navigate('/applications');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaFileAlt className="mr-3" />
            New {formData.applicationType === 'leave' ? 'Leave' : 'Outpass'} Application
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="applicationType"
                  value="leave"
                  checked={formData.applicationType === 'leave'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Leave
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="applicationType"
                  value="outpass"
                  checked={formData.applicationType === 'outpass'}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                Outpass
              </label>
            </div>
          </div>

          {/* Time/Date Fields */}
          {formData.applicationType === 'outpass' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Time *
                </label>
                <input
                  type="datetime-local"
                  name="initialTime"
                  value={formData.initialTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Return Time *
                </label>
                <input
                  type="datetime-local"
                  name="expectedReturnTime"
                  value={formData.expectedReturnTime}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Journey Date *
                </label>
                <input
                  type="date"
                  name="journeyDate"
                  value={formData.journeyDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Return Date *
                </label>
                <input
                  type="date"
                  name="returnDate"
                  value={formData.returnDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason *
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide a detailed reason for your application..."
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your complete address..."
            />
          </div>

          {/* Academic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attendance Percentage *
              </label>
              <input
                type="number"
                name="attendance"
                value={formData.attendance}
                onChange={handleInputChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 85.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Semester SGPA *
              </label>
              <input
                type="number"
                name="lastSemesterSGPA"
                value={formData.lastSemesterSGPA}
                onChange={handleInputChange}
                required
                min="0"
                max="10"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 8.5"
              />
            </div>
          </div>

          {/* Email Validation Fields */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Email Validation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Counsellor Email *
                </label>
                <input
                  type="email"
                  name="counsellorEmail"
                  value={formData.counsellorEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter counsellor's email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Warden Email *
                </label>
                <input
                  type="email"
                  name="wardenEmail"
                  value={formData.wardenEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter warden's email"
                />
              </div>
              {formData.applicationType === 'leave' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HOD Email *
                  </label>
                  <input
                    type="email"
                    name="hodEmail"
                    value={formData.hodEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter HOD's email"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Please ensure all email addresses are correct and match the registered users in the system.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/applications')}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FaTimes className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSave className="mr-2" />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewApplication; 