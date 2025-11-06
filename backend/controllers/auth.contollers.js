import bcrypt from 'bcrypt';
import User from '../models/user.model.js';
import genToken from '../utils/token.js';
import sendMail from '../utils/nodemailer.js';
import uploadOnCloudinary from "../utils/cloudinary.js"


export const signup = async (req, res) => {
    try {
        const { name, email, phoneNo, password, role } = req.body

        if (!name || !email || !phoneNo || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            })
        }
        const existUser = await User.findOne({
            $or: [{ email }, { phoneNo }]
        });

        if (!req.file?.path) {
            return res.status(400).json({
                success: false,
                message: 'Avatar is required.'
            })
        }

        if (existUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email.',
            });
        }

        const hashpassword = await bcrypt.hash(password, 9)

        const user = await User.create({
            name,
            email,
            phoneNo,
            role,
            password: hashpassword,
            avatar: "",
        });

        const token = genToken(user._id, user.role);

        res
            .cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000,
            })
            .status(201)
            .json({
                success: true,
                message: 'User created successfully.',
                data: user
            });

        (async () => {
            if (req.file?.path) {
                const imageUrl = await uploadOnCloudinary(req.file.path);
                if (imageUrl) {
                    await User.findByIdAndUpdate(user._id, { avatar: imageUrl });
                }
            }
            const ok = await sendMail(
                user.email,
                'Welcome to QuickSever!',
                "Welcome to QuickSever — we're thrilled to have you with us.",
                `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #007bff; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSever ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #007bff; margin-top: 0;">Welcome to QuickSever!</h2>
                <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  Thank you for joining <strong>QuickSever</strong> — we're thrilled to have you with us!
                  Your account has been created successfully, and you’re now ready to start exploring our services.
                </p>
                <p style="font-size: 15px; line-height: 1.6;">
                  If you ever need assistance, our support team is here to help — anytime.
                </p>

                <div style="text-align: center; margin-top: 25px;">
                  <button style="background-color: #007bff; color: #ffffff; padding: 12px 24px; border: none; border-radius: 5px; font-weight: bold; cursor: default;">
                    Log In to Your Account
                  </button>
                </div>

                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Cheers,<br>
                  <strong>The QuickSever Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSever. All rights reserved.</p>
                <p>
                  Visit our website | Contact support
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `
            );

            if (!ok) console.error('Welcome email failed (non-blocking).');
        })();

    } catch (error) {
        console.error('Error while creating the user:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while creating the user.'
        });
    }
};