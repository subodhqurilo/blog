import User from "../models/user.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
/**
 * ADMIN LOGIN
 * Sirf wahi login kar payega jiska role 'admin' hai.
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email check aur password fetch karna
    const user = await User.findOne({ email, role: "admin" }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Admin access denied or email not found",
      });
    }

    // Password compare karna
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // JWT Token generate karna
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin Login successful",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * REQUEST ADMIN OTP
 * Password change karne se pehle admin ke email par OTP jayega.
 */
export const requestAdminOTP = async (req, res) => {
  try {
    console.log("🔥 requestAdminOTP HIT");
    console.log("📥 Request body:", req.body);

    const { email } = req.body;

    if (!email) {
      console.warn("⚠️ Email missing");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    console.log("🔍 Finding admin with email:", email);

    const user = await User.findOne({ email, role: "admin" });

    if (!user) {
      console.warn("❌ Admin email not found:", email);
      return res
        .status(404)
        .json({ success: false, message: "Admin email not found" });
    }

    console.log("✅ Admin found:", user._id.toString());

    // ✅ 6-digit OTP (same as your code)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("🔐 Generated OTP:", otp);

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log("💾 OTP saved in DB");

    // 🚀 RESPONSE FIRST (Render-safe)
    res.json({
      success: true,
      message: "OTP sent to your registered email address",
      otp, // ⚠️ testing only (remove in prod)
    });

    console.log("📤 Response sent to client");

    // 🔥 SENDGRID EMAIL (BACKGROUND)
    try {
      console.log("📧 Preparing SendGrid email…");
      console.log(
        "🔑 SendGrid env check:",
        "KEY exists:", !!process.env.SENDGRID_API_KEY,
        "FROM:", process.env.SENDGRID_FROM_EMAIL
      );

      const msg = {
        to: email, // dynamic receiver
        from: process.env.SENDGRID_FROM_EMAIL, // verified single sender
        subject: "Admin Verification OTP - Blog Builder",
        html: `
          <h3>Admin OTP Verification</h3>
          <p>Your verification code is:</p>
          <h2>${otp}</h2>
          <p>This code is valid for 10 minutes.</p>
        `,
      };

      sgMail
        .send(msg)
        .then((response) => {
          console.log("✅ OTP email sent via SendGrid");
          console.log(
            "📨 SendGrid status:",
            response?.[0]?.statusCode
          ); // should be 202
        })
        .catch(async (err) => {
          console.error(
            "❌ SendGrid email failed:",
            err.response?.body || err.message
          );

          // optional cleanup
          user.otp = undefined;
          user.otpExpires = undefined;
          await user.save();
          console.log("↩️ OTP rolled back due to email failure");
        });

    } catch (mailErr) {
      console.error("❌ SendGrid background error:", mailErr.message);
    }

  } catch (error) {
    console.error("❌ requestAdminOTP error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};





// 🔥 STEP 2: VERIFY OTP (Frontend Screen 2)
// 1. VERIFY OTP (Screen 2)
export const verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body; // Ab yahan 'email' ki zarurat nahi hai

    if (!otp) {
      return res.status(400).json({ success: false, message: "Please enter OTP" });
    }

    // Backend khud 'admin' role wale user ko dhundega jiska OTP match ho
    const user = await User.findOne({ 
      role: "admin", 
      otp: otp, 
      otpExpires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // OTP sahi hai, flag true kar do agli screen ke liye
    user.isVerified = true; 
    await user.save();

    res.json({ 
      success: true, 
      message: "OTP Verified successfully. Now set your password." 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. RESET PASSWORD (Screen 3 - Sirf 2 Boxes)


// 🔥 STEP 3: RESET PASSWORD (Frontend Screen 3 - Sirf 2 Boxes)
export const resetAdminPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    // Backend khud dhundega ki kaunsa admin abhi verify hua hai
    const user = await User.findOne({ role: "admin", isVerified: true });

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: "Session expired or not verified. Please verify OTP again." 
      });
    }

    // Password Update
    user.password = newPassword;
    user.isVerified = false; // Kaam hone ke baad flag wapas false
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};