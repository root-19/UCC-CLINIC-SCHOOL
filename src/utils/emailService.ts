import { env } from '../config/env';

export interface EmailAttachment {
  filename: string;
  content: string | ArrayBuffer;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export const sendEmailNotification = async (options: EmailOptions): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${env.API_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = 'Failed to send email';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (jsonError) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }

    // Try to parse successful response
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error('Failed to parse email response:', jsonError);
      return { 
        success: false, 
        message: 'Invalid response from email service' 
      };
    }
    
    if (result.success) {
      return { success: true, message: 'Email sent successfully' };
    } else {
      return { 
        success: false, 
        message: result.message || 'Failed to send email notification' 
      };
    }
  } catch (error) {
    console.error('Email service error:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send email notification' 
    };
  }
};

export const createApprovalEmailTemplate = (studentName: string, requestDetails: any) => {
  return {
    subject: 'Medical Request Form Approved - UCC Clinic',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .status-badge { background: #10b981; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Request Approved</h1>
            <p>Your medical request form has been approved</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>We are pleased to inform you that your medical request form has been reviewed and approved by the UCC Clinic medical staff.</p>
            
            <div class="details">
              <h3>Request Details:</h3>
              <ul>
                <li><strong>Full Name:</strong> ${requestDetails.fullname}</li>
                <li><strong>School ID:</strong> ${requestDetails.schoolIdNumber}</li>
                <li><strong>Department:</strong> ${requestDetails.department}</li>
                <li><strong>Year & Section:</strong> ${requestDetails.yearSection}</li>
                <li><strong>Assessment:</strong> ${requestDetails.assessment}</li>
                <li><strong>Status:</strong> <span class="status-badge">APPROVED</span></li>
              </ul>
            </div>
            
            <p>Please proceed to the UCC Clinic during operating hours to receive your medication and/or medical attention.</p>
            
            <p><strong>Clinic Hours:</strong><br>
            Monday - Friday: 8:00 AM - 5:00 PM<br>
            Saturday: 8:00 AM - 12:00 PM<br>
            Sunday & Holidays: Closed</p>
            
            <p><strong>Location:</strong><br>
            UCC Clinic Building, Ground Floor<br>
            University of Caloocan City</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For inquiries, visit the UCC Clinic or call our hotline.</p>
            <p>&copy; 2024 University of Caloocan City Clinic. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

export const createRejectionEmailTemplate = (studentName: string, requestDetails: any, reason?: string) => {
  return {
    subject: 'Medical Request Form Update - UCC Clinic',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .status-badge { background: #ef4444; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
          .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Request Update</h1>
            <p>Your medical request form status has been updated</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>We have reviewed your medical request form and would like to provide you with an update on your request status.</p>
            
            <div class="details">
              <h3>Request Details:</h3>
              <ul>
                <li><strong>Full Name:</strong> ${requestDetails.fullname}</li>
                <li><strong>School ID:</strong> ${requestDetails.schoolIdNumber}</li>
                <li><strong>Department:</strong> ${requestDetails.department}</li>
                <li><strong>Year & Section:</strong> ${requestDetails.yearSection}</li>
                <li><strong>Assessment:</strong> ${requestDetails.assessment}</li>
                <li><strong>Status:</strong> <span class="status-badge">REJECTED</span></li>
              </ul>
            </div>
            
            ${reason ? `
              <div class="note">
                <h3>Additional Information:</h3>
                <p>${reason}</p>
              </div>
            ` : ''}
            
            <p>If you have any questions about this decision or need further assistance, please visit the UCC Clinic during operating hours.</p>
            
            <p><strong>Clinic Hours:</strong><br>
            Monday - Friday: 8:00 AM - 5:00 PM<br>
            Saturday: 8:00 AM - 12:00 PM<br>
            Sunday & Holidays: Closed</p>
            
            <p><strong>Location:</strong><br>
            UCC Clinic Building, Ground Floor<br>
            University of Caloocan City</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For inquiries, visit the UCC Clinic or call our hotline.</p>
            <p>&copy; 2024 University of Caloocan City Clinic. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

export const createProcessingEmailTemplate = (studentName: string, requestDetails: any) => {
  return {
    subject: 'Medical Request Form Processing - UCC Clinic',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Request Processing</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .status-badge { background: #3b82f6; color: white; padding: 5px 15px; border-radius: 20px; display: inline-block; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Request Processing</h1>
            <p>Your medical request form is being processed</p>
          </div>
          
          <div class="content">
            <p>Dear <strong>${studentName}</strong>,</p>
            
            <p>Your medical request form is currently being reviewed by our medical staff. We will notify you once a decision has been made.</p>
            
            <div class="details">
              <h3>Request Details:</h3>
              <ul>
                <li><strong>Full Name:</strong> ${requestDetails.fullname}</li>
                <li><strong>School ID:</strong> ${requestDetails.schoolIdNumber}</li>
                <li><strong>Department:</strong> ${requestDetails.department}</li>
                <li><strong>Year & Section:</strong> ${requestDetails.yearSection}</li>
                <li><strong>Assessment:</strong> ${requestDetails.assessment}</li>
                <li><strong>Status:</strong> <span class="status-badge">PROCESSING</span></li>
              </ul>
            </div>
            
            <p>Processing typically takes 1-2 business days. You will receive another email notification once your request has been approved or rejected.</p>
            
            <p><strong>Clinic Hours:</strong><br>
            Monday - Friday: 8:00 AM - 5:00 PM<br>
            Saturday: 8:00 AM - 12:00 PM<br>
            Sunday & Holidays: Closed</p>
          </div>
          
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>For inquiries, visit the UCC Clinic or call our hotline.</p>
            <p>&copy; 2024 University of Caloocan City Clinic. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};
