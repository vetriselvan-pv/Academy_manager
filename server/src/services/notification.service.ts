import nodemailer from "nodemailer";
import twilio from "twilio";
import { logger } from "../utils/logger";

// Retrieve credentials from env, or leave undefined
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const ACADEMY_PHONE = process.env.ACADEMY_PHONE;
const ACADEMY_EMAIL = process.env.ACADEMY_EMAIL || "admin@vivaacademy.com";

// Initialize transporters
let mailTransporter: nodemailer.Transporter | null = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  mailTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

let twilioClient: twilio.Twilio | null = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

export const notificationService = {
  async sendNewEnquiryAlert(enquiry: {
    name: string;
    email: string;
    phone: string;
    courseOfInterest: string;
    message?: string;
  }) {
    const textMessage = `New Enquiry from ${enquiry.name}!\nCourse: ${enquiry.courseOfInterest}\nPhone: ${enquiry.phone}\nEmail: ${enquiry.email}\nMessage: ${enquiry.message || "N/A"}`;

    // 1. Send SMS to Academy
    if (twilioClient && TWILIO_FROM_NUMBER && ACADEMY_PHONE) {
      try {
        await twilioClient.messages.create({
          body: textMessage,
          from: TWILIO_FROM_NUMBER,
          to: ACADEMY_PHONE,
        });
        logger.info(
          `SMS alert sent to academy for enquiry from ${enquiry.name}`,
        );
      } catch (error) {
        logger.error(error, "Failed to send SMS via Twilio");
      }
    } else {
      logger.info(`[MOCK SMS] Would send SMS to Academy: ${textMessage}`);
    }

    // 2. Send Email to Academy
    if (mailTransporter && ACADEMY_EMAIL) {
      try {
        await mailTransporter.sendMail({
          from: `"Viva Academy System" <${SMTP_USER || "no-reply@vivaacademy.com"}>`,
          to: ACADEMY_EMAIL,
          subject: `New Enquiry: ${enquiry.name} - ${enquiry.courseOfInterest}`,
          text: textMessage,
          html: `<p><strong>New Enquiry!</strong></p>
                 <ul>
                   <li><strong>Name:</strong> ${enquiry.name}</li>
                   <li><strong>Email:</strong> ${enquiry.email}</li>
                   <li><strong>Phone:</strong> ${enquiry.phone}</li>
                   <li><strong>Course:</strong> ${enquiry.courseOfInterest}</li>
                 </ul>
                 <p><strong>Message:</strong><br/>${enquiry.message || "N/A"}</p>`,
        });
        logger.info(
          `Email alert sent to academy for enquiry from ${enquiry.name}`,
        );
      } catch (error) {
        logger.error(error, "Failed to send Email via Nodemailer");
      }
    } else {
      logger.info(`[MOCK EMAIL] Would send Email to Academy: ${textMessage}`);
    }
  },
};
