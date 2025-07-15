import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaClipboardList, 
  FaUsers, 
  FaChartLine, 
  FaBell, 
  FaMobile, 
  FaShieldAlt,
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <FaClipboardList className="w-8 h-8" />,
      title: 'Digital Applications',
      description: 'Submit leave and outpass applications digitally with all required details and attachments.'
    },
    {
      icon: <FaUsers className="w-8 h-8" />,
      title: 'Multi-level Approval',
      description: 'Streamlined approval process through counsellor, HOD, Joint Director, and Warden.'
    },
    {
      icon: <FaChartLine className="w-8 h-8" />,
      title: 'Real-time Tracking',
      description: 'Track application status in real-time with detailed progress updates.'
    },
    {
      icon: <FaBell className="w-8 h-8" />,
      title: 'Instant Notifications',
      description: 'Receive email and SMS notifications for application status changes.'
    },
    {
      icon: <FaMobile className="w-8 h-8" />,
      title: 'Mobile Friendly',
      description: 'Access the system from any device with a responsive, mobile-optimized interface.'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8" />,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with data encryption and secure authentication.'
    }
  ];

  const benefits = [
    'Eliminates paper-based processes',
    'Reduces processing time significantly',
    'Improves transparency and accountability',
    'Centralized data management',
    'Easy access to application history',
    'Automated notifications and reminders'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Leave Management System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Streamline your college's leave and outpass application process with our comprehensive digital platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                >
                  Go to Dashboard
                  <FaArrowRight className="ml-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage leave applications efficiently and transparently.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Our System?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Transform your traditional paper-based leave management into a modern, efficient digital system that benefits everyone.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center">
                    <FaCheckCircle className="text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Application Workflow
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="font-medium">Student</span>
                    <FaArrowRight className="text-blue-600" />
                    <span className="font-medium">Counsellor</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="font-medium">Counsellor</span>
                    <FaArrowRight className="text-blue-600" />
                    <span className="font-medium">HOD</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="font-medium">HOD</span>
                    <FaArrowRight className="text-blue-600" />
                    <span className="font-medium">Joint Director</span>
                  </div>
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg">
                    <span className="font-medium">Joint Director</span>
                    <FaArrowRight className="text-blue-600" />
                    <span className="font-medium">Warden</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and administrators who have already streamlined their leave management process.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Start Your Free Trial
              <FaArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 