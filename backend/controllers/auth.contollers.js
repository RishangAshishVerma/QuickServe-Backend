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

    if (existUser) {
      if (existUser.isDelete === true) {
        return res.status(403).json({
          success: false,
          message: 'This account has been deleted. Please contact customer support for assistance.'
        });
      }
      if (existUser) {

        if (existUser?.suspend) {
          return res.status(403).json({
            success: false,
            message: 'This account has been suspended. Please contact customer support for assistance.'
          });
        }
      }

      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number.',
      });
    }


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
    console.error(`'Error while creating the user:'${error}`, error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while creating the user.',
    });
  }
};

export const signIn = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields (name, email, password) are required.'
      });
    }

    const existUser = await User.findOne({ email })

    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: 'No account found with the provided email.'
      });
    }

    if (existUser.isDelete === true) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deleted. Please contact customer support for assistance.'
      });
    }
    if (existUser?.suspend) {
      return res.status(403).json({
        success: false,
        message: 'This account has been suspended. Please contact customer support for assistance.'
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, existUser.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = genToken(existUser._id, existUser.role);

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .status(200)
      .json({
        success: true,
        message: 'User logged in successfully.',
        data: existUser
      });

  } catch (error) {

    console.error('Error while logging in the user:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while logging in.'
    });
  }
};

export const signOut = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'User logged out successfully.',
    });
  } catch (error) {
    console.error('Error while logging out the user:', error);
    return res.status(500).json({
      success: false,
      message: 'An unexpected error occurred while logging out.',
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User token not found.",
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, email, password) are required.",
      });
    }

    const existUser = await User.findOne({ _id: userId, email });
    if (!existUser) {
      return res.status(404).json({
        success: false,
        message: "No account found with the provided email.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, existUser.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Mark user as deleted
    existUser.isDelete = true;
    await existUser.save();

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    }).status(200).json({
      success: true,
      message: "User account deleted successfully.",
      data: {
        id: existUser._id,
        name: existUser.name,
        email: existUser.email,
        role: existUser.role,
        isDelete: existUser.isDelete,
      },
    });

    return;
  } catch (error) {
    console.error("Error while deleting user account:", error);
    if (res.headersSent) return; // Guard: don't send twice
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred while deleting the account.",
    });
  } finally {

    (async () => {
      try {
        const ok = await sendMail(
          req.body.email,
          "Your QuickSever Account Has Been Deleted",
          "Important: Your QuickSever account has been permanently deleted.",
          `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #6c757d; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSever ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #6c757d; margin-top: 0;">Account Deleted</h2>
                <p style="font-size: 16px;">Hi <strong>${req.body.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  This is to confirm that your <strong>QuickSever</strong> account has been permanently deleted.
                </p>
                <p style="font-size: 15px; line-height: 1.6;">
                  All your associated data and settings have been removed from our systems in accordance with our data retention policies.
                </p>
                <div style="text-align: center; margin-top: 25px;">
                  <button style="background-color: #6c757d; color: #ffffff; padding: 12px 24px; border: none; border-radius: 5px; font-weight: bold; cursor: default;">
                    Account Deleted
                  </button>
                </div>
                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  We’re sorry to see you go. Thank you for being part of QuickSever.<br>
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
  </div>`
        );

        if (!ok) console.error("Account deletion email failed (non-blocking).");
      } catch (error) {
        console.error('Error while deleting user account:', error);
        return res.status(500).json({
          success: false,
          message: 'An unexpected error occurred while deleting the account.',
        });
      }
    })(); // <------------------------------------------------------------------ IIFE end here
  }
};

export const addAddress = async (req, res) => {
  try {
    const { address, userLocation } = req.body
    const userId = req.user.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "user id not found."
      })
    }

    if (!userLocation ||
      userLocation.type !== "Point" ||
      !Array.isArray(userLocation.coordinates) ||
      userLocation.coordinates.length !== 2 ||
      typeof userLocation.coordinates[0] !== "number" ||
      typeof userLocation.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Store location must be a valid GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }",
      })
    }

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "address canot be empty",
      })
    }
    const existing = await User.findById(userId)
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      })
    }

    if (existing.isDelete === true) {
      return res.status(403).json({
        success: false,
        message: "User account is deleted."
      })
    }

    if (existing.suspend === true) {
      return res.status(403).json({
        success: false,
        message: "User account is suspended."
      })
    }

    const updateUser = await User.findByIdAndUpdate(userId, {
      address,
      userLocation
    }, { new: true }).select("-password")

    return res.status(200).json({
      success: true,
      message: "User address added successfully",
      data: {
        address: updateUser.address,
        userLocation: updateUser.userLocation
      }
    });

  } catch (error) {
    console.error(`Error while adding the user address:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to add user address. Please try again later.",

    });
  }
}