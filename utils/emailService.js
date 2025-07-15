const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();
    
    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    const info = await transporter.sendMail(message);
    console.log('Email sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

// Email templates
const emailTemplates = {
  applicationSubmitted: (studentName, applicationType) => ({
    subject: `Application Submitted - ${applicationType.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Application Submitted Successfully</h2>
        <p>Dear ${studentName},</p>
        <p>Your ${applicationType} application has been submitted successfully and is now under review.</p>
        <p>You will receive updates on the status of your application via email.</p>
        <p>Thank you for using our Leave Management System.</p>
        <br>
        <p>Best regards,<br>College Administration</p>
      </div>
    `
  }),

  applicationApproved: (studentName, applicationType, approvedBy, comments) => ({
    subject: `Application Approved - ${applicationType.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">Application Approved</h2>
        <p>Dear ${studentName},</p>
        <p>Your ${applicationType} application has been approved by ${approvedBy}.</p>
        ${comments ? `<p><strong>Comments:</strong> ${comments}</p>` : ''}
        <p>Please check your application status in the portal for further details.</p>
        <br>
        <p>Best regards,<br>College Administration</p>
      </div>
    `
  }),

  applicationRejected: (studentName, applicationType, rejectedBy, reason) => ({
    subject: `Application Rejected - ${applicationType.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">Application Rejected</h2>
        <p>Dear ${studentName},</p>
        <p>Your ${applicationType} application has been rejected by ${rejectedBy}.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>You may submit a new application if needed.</p>
        <br>
        <p>Best regards,<br>College Administration</p>
      </div>
    `
  }),

  newApplicationNotification: (adminName, studentName, applicationType) => ({
    subject: `New Application Pending - ${applicationType.toUpperCase()}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3498db;">New Application Pending Review</h2>
        <p>Dear ${adminName},</p>
        <p>A new ${applicationType} application has been submitted by ${studentName} and requires your review.</p>
        <p>Please log in to the admin portal to review and take action on this application.</p>
        <br>
        <p>Best regards,<br>Leave Management System</p>
      </div>
    `
  })
};

module.exports = {
  sendEmail,
  emailTemplates
}; 