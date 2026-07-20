import nodemailer from "nodemailer";
import { transporter } from "../config/mail.js";

export const sendVerificationEmail = async (email, verificationToken) => {

    const verificationURL = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`

    await transporter.sendMail({

        from: process.env.EMAIL,

        to: email,

        subject: "Verify Your SkillSphere Account",

        html: `
            <h2>Welcome to SkillSphere!</h2>
            <p>Click the button below to verify your account.</p>
            <a 
                href="${verificationURL}"
                style= "
                    background: #2563eb;
                    color: white;
                    padding: 12px 20px;
                    text-decoration: none;
                    border-radius: 6px;
                    display: inline-block;
                "
            >
                Verify Email
            </a>
            <p> Ths link expires in 10 minutes</p>
        `
    })
}



export const sendNotificationEmail = async ({ to, title, message }) => {
  try {
    await transporter.sendMail({
      from: `"SkillSphere" <${process.env.EMAIL}>`,
      to,
      subject: title,

      html: `
        <div style="font-family:Arial;padding:30px">
            <h2>${title}</h2>

            <p>${message}</p>

            <br>

            <a href="${process.env.CLIENT_URL}"
               style="
               padding:12px 20px;
               background:#4F46E5;
               color:white;
               text-decoration:none;
               border-radius:8px;
               ">
               Open SkillSphere
            </a>
        </div>
      `,
    });
  } catch (err) {
    console.log(err);
  }
};


export const sendPasswordResetEmail = async (email, resetUrl) => {
    try {
        await transporter.sendMail({
            from: `"SkillSphere" <${process.env.EMAIL}>`,
            to: email,
            subject: 'SkillSphere - Password Reset Request',
            html: `
                <div style="font-family: Arial, sans-serif; max-w-md: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #1f2937;">Password Reset Request</h2>
                    <p style="color: #4b5563;">You recently requested to reset your password for your SkillSphere account. Click the button below to choose a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">If you did not request this, please ignore this email. This link will expire in 15 minutes.</p>
                </div>
            `,
        });
        console.log("Password reset email sent to:", email);
    } catch (error) {
        console.error("Error sending password reset email:", error);
        throw new Error("Failed to send email");
    }
};