import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";

// Controller for Registering new User
export const register = async (req, res) => {
  const { name, email, password, phoneNum, role, dateOfBirth, address } =
    req.body;

  if (!name || !email || !password || !role || !dateOfBirth || !address) {
    return res.json({ success: false, message: "Missing Details " });
  }

  try {
    const existingUser = await userModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: "User Already exists" });
    }
    // encrypting the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      phoneNum,
      role,
      dateOfBirth,
      address,
    });
    await user.save();

    // Jwt token generate
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // sending the token to user via cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // sending account created email to the new register
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const signinUrl = `${frontendUrl}/signin`;
    const isTeacher = role.toLowerCase() === "teacher";

    const mailOptions = {
      from: `"TeachGrid | Management System" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: "Welcome to TeachGrid - Your Account is Ready!",
      html: `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #000000; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">TeachGrid</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Teachgrid Management System</p>
        </div>

        <div style="padding: 40px; color: #1e293b; line-height: 1.6;">
            <h2 style="color: #0f172a; margin-bottom: 20px;">Hello ${name},</h2>
            <p style="font-size: 16px;">Welcome! Your <b>${role.toUpperCase()}</b> account has been successfully created. You can now access the TechGrid Management System.</p>
            
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 25px; margin: 30px 0; border-radius: 12px;">
                <h4 style="margin: 0 0 15px 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Login Credentials</h4>
                
                <p style="margin: 0; font-size: 14px; color: #64748b;">Login Email:</p>
                <p style="margin: 4px 0 15px 0; font-size: 16px; font-weight: 600; color: #0f172a;">${email}</p>
                
              <p style="margin: 0; font-size: 14px; color: #64748b;">Your Password:</p>
<div style="margin-top: 8px; background-color: #f8fafc; border: 2px dashed #cbd5e1; padding: 15px; border-radius: 8px; text-align: center;">
    <span style="font-size: 16px; color: #ef4444; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-weight: bold;">
        Please contact the Admin to get your password.
    </span>
</div>

                ${
                  isTeacher
                    ? `
                    <p style="margin: 15px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                        <i><b>Note:</b> This is a secure system-generated password. Only an Administrator can modify your account details.</i>
                    </p>
                `
                    : `
                    <p style="margin: 15px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.4;">
                        <i><b>Note:</b> As an Admin, you have the privilege to change this password via your profile settings.</i>
                    </p>
                `
                }
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="${signinUrl}" style="background-color: #000000; color: #ffffff; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">Login to Dashboard</a>
            </div>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 40px 0 20px 0;" />
            <p style="font-size: 13px; color: #64748b; margin: 0;">Best Regards,<br><b>TeachGrid Administration</b></p>
        </div>

        <div style="background-color: #f8fafc; padding: 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">Questions? <a href="mailto:support@teachgrid.com" style="color: #64748b;">support@teachgrid.com</a></p>
            <p style="margin: 8px 0 0 0;">&copy; ${new Date().getFullYear()} TeachGrid. All rights reserved.</p>
        </div>
    </div>
    `,
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Controller for signing in user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Email and Password are required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email! User cannot be found",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Password!" });
    }

    // Jwt token generate
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // sending the token to user via cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, role: user.role });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller for Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.json({ success: true, message: "Logged Out Successfully" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// sending verification OTP to the user
export const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModel.findById(userId);

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "user has been already verified",
      });
    }

    // Generating a 6 digit randon number
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    // Adding the otp to the db
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    // Email for the user
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account Verification OTP",
      text: `Your OTP to verify your account at TeachGrid is ${otp}
            
            If you did not request this account or believe this is a mistake, contact support at support@teachgrid.com.`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "Verification email has been sent via email",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// verifying email controller
export const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Mising details" });
  }

  try {
    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid User, User Not Found!",
      });
    }

    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP has expired!" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "User Email has been Successfully verified",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

//controller to check if user is authenticated
export const isAuthenticated = async (req, res) => {
  try {
   
    return res.json({ success: true, message: "User is authenticated" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to return authenticated user's profile
export const me = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.json({ success: false, message: "User is not authenticated" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User Not Found!" });
    }

    return res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNum: user.phoneNum,
        isAccountVerified: user.isAccountVerified,
      },
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to send reset pasword otp
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: "Email Missing" });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not Found!" });
    }

    // generate a random otp
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

    await user.save();

    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      text: ` Use this OTP to reset your password : ${otp}, Note: this OTP expires is 15 min
            
            If you did not request this account or believe this is a mistake, contact support at support@teachgrid.com.`,
    };
    await transporter.sendMail(mailOptions);

    return res.json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

// Controller to reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing details " });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not Found!" });
    }

    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP!" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired!" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;

    await user.save();

    return res.json({
      success: true,
      message: "Password has been reset successfully!",
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
