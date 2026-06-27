import { transporter } from "../config/mail.js";

export const sendVerificationEmail = async (email, verificationToken) => {

    const verificationURL = `${process.env.CLIENT_URL}/verify/${verificationToken}`

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