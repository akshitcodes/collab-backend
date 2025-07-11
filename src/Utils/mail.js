// src/utils/mailService.js
import nodemailer from 'nodemailer';

// Set up Zoho SMTP transporter
export const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: 'admin@collablearn.in', // replace with your Zoho mail
    pass: 'Akshit@zoho',        // use Zoho app password
  },
});

// Predefined templates based on subject
const templates = {
  welcome: (name) => ({
  subject: '🎉 Welcome to Collablearn – Let’s Learn Together!',
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: auto; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h2 style="color: #333;">Hi ${name},</h2>

      <p style="font-size: 16px; color: #555;">
        Welcome to <strong>Collablearn</strong> — your place to learn and build together with like-minded peers.
      </p>

      <p style="font-size: 16px; color: #555;">
        Whether you're diving into React, working on real-world projects, or just getting started, you're in the right place. Your learning journey is about to get more collaborative, focused, and fun.
      </p>

      <p style="font-size: 16px; color: #555;">
        🚀 Start exploring collabs, or create your own to bring your ideas to life.
      </p>

      <p style="font-size: 16px; color: #555;">
        If you have any questions or ideas, just reply to this email — we're all ears!
      </p>

      <p style="font-size: 16px; color: #333;">
        Cheers,<br>
        The Collablearn Team
      </p>

      <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;">

      <small style="color: #999; font-size: 12px;">
        You received this email because you signed up at Collablearn. If this wasn't you, you can safely ignore it.
      </small>
    </div>
  `,
})
,


  verifyEmail: (name, token) => ({
    subject: 'Verify your email address',
    html: `<p>Hi ${name},</p><p>Please <a href="https://collablearn.in/verify/${token}">click here</a> to verify your email.</p>`,
  }),

  // Add more templates here
};

// General function to send mail
export const sendMail = async ({ to, type, data }) => {
  if (!templates[type]) throw new Error('Invalid mail type');

  const { subject, html } = templates[type](...data);
  try{
  await transporter.sendMail({
    from: '"Collablearn" <admin@collablearn.in>',
    to,
    subject,
    html,
  });
  console.log(`Mail sent to ${to} with subject: ${subject}`);
} catch (error) {
  console.error(`Failed to send mail to ${to}:`, error);
  throw error;
}
};
