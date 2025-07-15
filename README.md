# LeaveEase

A comprehensive full-stack web application for managing student leave and outpass applications in colleges. This system streamlines the traditional paper-based leave application process by providing a digital platform where students can submit applications that are routed through various administrative levels for approval.

## Features

### User Registration System
- **Multi-User Type Registration**: Separate registration forms for different user types
  - **Student**: Complete profile with academic and hostel details
  - **Counsellor**: Faculty counsellors with department assignment
  - **HOD**: Heads of Department with department assignment
  - **Warden**: Hostel wardens with year assignment
  - **Joint Director**: Single joint director for the college
- **Email Validation**: All emails must match registered users in the database
- **Role-Based Access**: Different dashboards and permissions for each user type

### Student Features
- **User Registration & Profile Management**: Complete student profile with personal details, academic information, and hostel details
- **Leave Application**: Submit leave applications with email validation for counsellor, HOD, and warden
- **Outpass Application**: Submit outpass applications with email validation for counsellor and warden
- **Application Tracking**: Real-time status tracking of submitted applications
- **Profile Management**: Update personal information and view application history
- **Pending Application Prevention**: Cannot submit new applications while one is pending

### Administrative Features
- **Multi-level Approval System**: 
  - Counsellor → HOD → Joint Director → Warden (for Leave)
  - Counsellor → Warden (for Outpass)
- **Application Dashboard**: View and manage pending applications
- **Student Profile Access**: Quick access to student details via profile pictures
- **Email Notifications**: Automated email notifications for application status changes
- **SMS Notifications**: Twilio integration for SMS alerts

### Technical Features
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **File Upload**: Cloudinary integration for profile image uploads
- **Real-time Updates**: Application status updates in real-time
- **Responsive Design**: Modern, mobile-friendly UI
- **Email Integration**: Nodemailer for automated email notifications

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud image storage
- **Twilio** - SMS notifications
- **Nodemailer** - Email notifications

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Icons** - Icon library

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd leave-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   Edit `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret
   - Cloudinary credentials
   - Twilio credentials
   - Email configuration

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the React app**
   ```bash
   npm start
   ```

## Database Schema

### User Models (Separate Collections)
- **Student Model**: Personal details, academic info, hostel details, parent mobile
- **Counsellor Model**: Personal details, department assignment
- **HOD Model**: Personal details, department assignment
- **Warden Model**: Personal details, year assignment
- **Joint Director Model**: Personal details (only one allowed)

### Application Model
- Application type (leave/outpass)
- Student details
- Date/time information
- Reason and address
- Academic performance (attendance, SGPA)
- Email validation fields (counsellor, HOD, warden emails)
- Approval status and workflow
- Admin comments

## API Endpoints

### Authentication
- `POST /api/auth/register/student` - Student registration
- `POST /api/auth/register/counsellor` - Counsellor registration
- `POST /api/auth/register/hod` - HOD registration
- `POST /api/auth/register/warden` - Warden registration
- `POST /api/auth/register/joint-director` - Joint Director registration
- `POST /api/auth/login` - User login (works for all user types)
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Applications
- `POST /api/applications` - Create new application
- `GET /api/applications` - Get user applications
- `GET /api/applications/:id` - Get specific application
- `PUT /api/applications/:id/approve` - Approve application
- `PUT /api/applications/:id/reject` - Reject application

### Admin
- `GET /api/admin/applications` - Get pending applications
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id` - Update user details

## Workflow

### Leave Application Flow
1. Student submits leave application
2. Counsellor reviews and approves/rejects
3. If approved, HOD reviews and approves/rejects
4. If approved, Joint Director reviews and approves/rejects
5. If approved, Warden makes final decision
6. Student receives notification of final status

### Outpass Application Flow
1. Student submits outpass application
2. Counsellor reviews and approves/rejects
3. If approved, Warden makes final decision
4. Student receives notification of final status

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For support and questions, please open an issue in the repository. 