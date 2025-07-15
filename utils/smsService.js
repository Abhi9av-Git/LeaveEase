const twilio = require('twilio');

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send SMS function
const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    
    console.log('SMS sent successfully:', result.sid);
    return true;
  } catch (error) {
    console.error('SMS sending failed:', error);
    return false;
  }
};

// SMS templates
const smsTemplates = {
  applicationSubmitted: (applicationType) => 
    `Your ${applicationType} application has been submitted successfully and is under review. You will receive updates via email.`,

  applicationApproved: (applicationType, approvedBy) => 
    `Your ${applicationType} application has been approved by ${approvedBy}. Please check your email for details.`,

  applicationRejected: (applicationType, rejectedBy) => 
    `Your ${applicationType} application has been rejected by ${rejectedBy}. Please check your email for details.`,

  newApplicationNotification: (studentName, applicationType) => 
    `New ${applicationType} application submitted by ${studentName} requires your review. Please log in to the admin portal.`
};

module.exports = {
  sendSMS,
  smsTemplates
}; 