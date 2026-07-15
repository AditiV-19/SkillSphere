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