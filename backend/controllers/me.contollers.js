
import User from "../models/user.model.js"
import sendMail from "../utils/nodemailer.js"

export const getUser = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User token not found.",
            });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (user.isDelete === true) {
            return res.status(403).json({
                success: false,
                message:
                    "This account has been deleted. Please contact customer support for assistance.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details retrieved successfully.",
            data: user,
        });

    } catch (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching user details.",
        });
    }
};

export const updateUserDetails = async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User token not found.",
            });
        }

        const existUser = await User.findById(userId).select('-password');

        if (!existUser) {
            return res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        if (existUser.isDelete === true) {
            return res.status(403).json({
                success: false,
                message: 'This account has been deleted. Please contact customer support for assistance.',
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            {
                name: name || existUser.name,
                avatar: avatar || existUser.avatar,
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'User details updated successfully.',
            data: user,
        });
        (async () => {
            try {
                if (req.file?.path) {
                    const imageUrl = await uploadOnCloudinary(req.file.path);
                    if (imageUrl) {
                        await User.findByIdAndUpdate(user._id, { avatar: imageUrl });
                    }
                }

                const ok = await sendMail(
                    user.email,
                    'Your QuickSever Account Has Been Updated',
                    "Your QuickSever account details have been successfully updated.",
                    `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" 
                 style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <tr>
              <td style="background-color: #007bff; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSever ⚡</h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #007bff; margin-top: 0;">Your Account Has Been Updated</h2>
                <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>

                <p style="font-size: 15px; line-height: 1.6;">
                  This is a quick note to let you know that your <strong>QuickSever account details</strong> 
                  have been successfully updated.
                </p>

                <p style="font-size: 15px; line-height: 1.6;">
                  If you did not make these changes, please contact our support team immediately to secure your account.
                </p>

                <div style="text-align: center; margin-top: 25px;">
                  <span style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 24px; 
                                border-radius: 5px; text-decoration: none; font-weight: bold;">
                    Review My Account
                  </span>
                </div>

                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Cheers,<br>
                  <strong>The QuickSever Team</strong>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSever. All rights reserved.</p>
                <p>This is an automated message — please do not reply.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `
                );

                if (!ok) {
                    console.error('Account update email failed (non-blocking).');
                }
            } catch (error) {
                console.error('Error during account update email process:', error);
            }
        })();


    } catch (error) {
        console.error('Error updating user details:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while updating user details.',
        });
    }
};

