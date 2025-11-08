import User from "../models/user.model.js"
import sendMail from "../utils/nodemailer.js";

export const searchUsers = async (req, res) => {
  try {
    const { name, email } = req.query;
    const filter = { isDelete: false };

    if (name) {
      filter.name = { $regex: name, $options: "i" };
    }

    if (email) {
      filter.email = { $regex: email, $options: "i" };
    }

    const users = await User.find(filter).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error while finding the users:", error);
    res.status(500).json({
      success: false,
      message: "Error while finding the users.",
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params; // ✅ Extract the user ID from params

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided',
      });
    }

    const existingUser = await User.findById(id).select('-password');

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User found successfully',
      data: existingUser,
    });

  } catch (error) {
    console.error('Error fetching user:', error);

    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
    });
  }
};

export const suspendUser = async (req, res) => {
  try {
    const { suspendedReason, suspendTime } = req.body
    const userId = req.params.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided',
      });
    }

    if (!suspendedReason) {
      return res.status(400).json({
        success: false,
        message: 'all feild are required',
      });
    }

    const existingUser = await User.findById(userId).select("-passwod").lean()

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }


    await User.findByIdAndUpdate(userId, {
      suspend: true,
      suspendedReason,
    });

    res.json({
      success: true,
      message: `User suspended`,
      data: existingUser,
    });

    (async () => {
      const ok = await sendMail(
        existingUser.email,
        'Your QuickSever Account Has Been Suspended',
        'Important: Your QuickSever account has been temporarily suspended.',
        `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #dc3545; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSever ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #dc3545; margin-top: 0;">Account Suspended</h2>
                <p style="font-size: 16px;">Hi <strong>${existingUser.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  We regret to inform you that your <strong>QuickSever</strong> account has been temporarily suspended.
                </p>

                <p style="font-size: 15px; line-height: 1.6;">
                  <strong>Reason:</strong> ${suspendedReason}<br>
                  <strong>Suspension Time:</strong> ${suspendTime}
                </p>

                <p style="font-size: 15px; line-height: 1.6;">
                  If you believe this was a mistake or wish to appeal the suspension, please reach out to our support team.
                </p>

                <div style="text-align: center; margin-top: 25px;">
                  <button style="background-color: #dc3545; color: #ffffff; padding: 12px 24px; border: none; border-radius: 5px; font-weight: bold; cursor: default;">
                    Account Suspended
                  </button>
                </div>

                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Regards,<br>
                  <strong>The QuickSever Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSever. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `
      );

      if (!ok) console.error('Suspension email failed (non-blocking).');
    })();


  } catch (error) {

    console.log(`error wheil suspending the user ${error}`);
    res.json({
      success: false,
      message: `error while suspein the user`,
    });
  }
}

export const unsuspendUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not provided',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { suspend: false, suspendedReason: "" },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      message: 'User unsuspended successfully',
      data: {
        id: user._id,
        suspend: user.suspend,
        unsuspendTime: new Date()
      }
    });

  
    sendMail(
      user.email,
      'Your QuickSever Account Has Been Unsuspended',
      'Good news: Your QuickSever account is now active again.',
      `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #28a745; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSever ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #28a745; margin-top: 0;">Account Unsuspended</h2>
                <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  Good news — your <strong>QuickSever</strong> account has been reviewed and unsuspended.
                  You now have full access to your account and services again.
                </p>

                <div style="text-align: center; margin-top: 25px;">
                  <button style="background-color: #28a745; color: #ffffff; padding: 12px 24px; border: none; border-radius: 5px; font-weight: bold; cursor: default;">
                    Account Active
                  </button>
                </div>

                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Welcome back,<br>
                  <strong>The QuickSever Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSever. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
      `
    ).catch(err => {
      console.error('Unsuspension email failed (non-blocking):', err);
    });

  } catch (error) {
    console.error(`error while unsuspending the user ${error}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to unsuspend user',
    });
  }
};

