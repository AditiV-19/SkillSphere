import {User} from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.services.js';
import crypto from 'crypto'
import { ClientProfile, FreelancerProfile } from '../models/profile.model.js';


// Register
export const registerUser = async(req, res) =>{
    try {
        const {username , email, password, role} = req.body;

        // basic validation
        if(!username || !email || !password || !role){
            return res.status(400).json({ message: "All fields are important" })
        }

        // check if user exists already
        const existing = await User.findOne({ email: email.toLowerCase()});
        if(existing){
            return res.status(400).json({ message: "User already exists!" })
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters."
            });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex")
        
        const hashedToken = crypto.createHash("sha256").update(verificationToken).digest("hex")

        // create user
        const user = await User.create({
            username,
            password,
            email: email.toLowerCase(),
            role,
            isVerified: false,
            verificationToken: hashedToken,
            verificationTokenExpires: Date.now() + 1000 * 60 * 10
        });

        // Create empty profile
        if (role === 'freelancer') {
            await FreelancerProfile.create({ user: user._id });
            console.log("Freelancer profile created");
        } else if (role === 'client') {
            await ClientProfile.create({ user: user._id, companyName: username }); 
            console.log("Client profile created");
        }

        // Send verification email
        await(sendVerificationEmail(user.email, verificationToken))

        res.status(201).json({
            message: 'User registered successfully!',
            user: { id: user._id, email: user.email, username: user.username, role: user.role}
        })

    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error:error.message });
    }
}


// Login

export const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body

        // check if the user exists
        const user = await User.findOne({email: email.toLowerCase()});
        if(!user){
            return res.status(400).json({ message: 'User not found' })
        }

        // compare password
        const isMatch = await user.comparePassword(password);
        if(!isMatch) return res.status(400).json({
            message: "Invalid credentials"
        })

        // check if verification token true
        if(!user.isVerified) return res.status(400).json({
            message: "Please verify your email before logging in."
        })

        const token = jwt.sign(
            {   id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(200).json({
            message: 'Login successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            }
        })

    } catch (error) {
        res.status(500).json({message: 'Internal Server Error', error: error.message})
    }
}

// Google OAuth

export const googleLogin = async (req, res) => {
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  const { credential, role } = req.body; 

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name: username, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      if (!role || !["client", "freelancer"].includes(role.toLowerCase())) {
        return res
          .status(400)
          .json({ message: "Valid role (client/freelancer) is required for new users." });
      }

      user = new User({
        username,
        email,
        googleId,
        role: role.toLowerCase(), 
        isVerified: true, 
      });
      await user.save();

      if (user.role === 'freelancer') {
          await FreelancerProfile.create({ user: user._id });
      } else if (user.role === 'client') {
          await ClientProfile.create({ user: user._id, companyName: username }); 
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({
        message: "Google login successful",
        token,
        user: { 
            id: user._id, 
            username: user.username, 
            role: user.role, 
            email: user.email 
        },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid Google Token", error: error.message });
  }
};



// Logout

export const logoutUser = async(req, res) => {
    res.status(200).json({
            message: 'Logout successfully',
    })
}


// Verify Email

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired verification link"
            });
        }

        user.isVerified = true;

        user.verificationToken = "";

        user.verificationTokenExpires = undefined;

        await user.save();

        return res.status(200).json({
            message: "Email verified successfully!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message
        });
    }
}

// ==========================================
// 1. FORGOT PASSWORD (Generate Token & Email)
// ==========================================
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: "User with this email does not exist." });
        }

        // Generate a random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash it before saving to the database for security
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        // Set token and expiration (e.g., 15 minutes from now)
        user.resetPasswordToken = hashedToken;
        const expireTime = new Date(Date.now() + 15 * 60 * 1000);
        user.resetPasswordExpires = expireTime;

        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
        
        await sendPasswordResetEmail(user.email, resetUrl);

        res.status(200).json({ message: "Password reset link sent to your email." });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// ==========================================
// 2. RESET PASSWORD (Verify Token & Save New Password)
// ==========================================
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        // Hash the token from the URL so we can compare it to the database
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // Find user with matching token that hasn't expired yet
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token is invalid or has expired." });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters." });
        }

        // Update password and clear the reset token fields
        user.password = newPassword; // The pre('save') hook will hash this automatically!
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password successfully reset. You can now log in." });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};