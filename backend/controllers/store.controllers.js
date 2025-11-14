import uploadOnCloudinary from "../utils/cloudinary.js "
import Store from "../models/store.model.js";
import User from '../models/user.model.js';
import { DateTime } from "luxon";
import sendMail from '../utils/nodemailer.js';
import verificationRequest from "../models/VerificationRequest.js";
import _ from "lodash"
import fs from "fs";
import path from "path";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
const keyByLuxonWeekday = (w) => dayKeys[w - 1]

const normalizeOpeningHours = (openingHours) => {
  const defaultDay = { enabled: true, open: "09:00", close: "18:00" }
  const obj = {};
  for (const k of dayKeys) obj[k] = openingHours?.[k] ?? defaultDay
  return obj;
}

export const createStore = async (req, res) => {
  try {
    const {
      storeName,
      storeTimezone = "Asia/Kolkata",
      storeLocation,
      openingHours,
      storeEmail
    } = req.body

    const ownerId = req.user.id

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required."
      })
    }

    if (!storeName || !storeName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required."
      })
    }

    if (!storeEmail || !storeEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: " store email is required."
      })
    }

    if (typeof storeTimezone !== "string" || !storeTimezone.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store timezone must be a valid string."
      })
    }

    if (!storeLocation ||
      storeLocation.type !== "Point" ||
      !Array.isArray(storeLocation.coordinates) ||
      storeLocation.coordinates.length !== 2 ||
      typeof storeLocation.coordinates[0] !== "number" ||
      typeof storeLocation.coordinates[1] !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message: "Store location must be a valid GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }",
      })
    }

    if (openingHours && typeof openingHours !== "object") {
      return res.status(400).json({
        success: false,
        message: "Opening hours must be an object."
      })
    }

    const normalizedHours = normalizeOpeningHours(openingHours)

    const store = await Store.create({
      owner: ownerId,
      storeName: storeName.trim(),
      storeTimezone,
      storeLocation,
      openingHours: normalizedHours,
      isVerified: false,
      status: "pending",
      storeEmail
    })

    res.status(201).json({
      success: true,
      message: `Store "${storeName}" created successfully.`,
    })

    const user = await User.findById(ownerId).select("email name")

    const ok = await sendMail(
      user.email,
      'Your Store Has Been Created Successfully — QuickSevere',
      "Your store on QuickSevere has been created successfully. Please upload your documents for verification.",
      `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: #007bff; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSevere ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: #007bff; margin-top: 0;">Store Created Successfully!</h2>
                <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  Congratulations! Your store has been successfully created on <strong>QuickSevere</strong>.
                </p>
                <p style="font-size: 15px; line-height: 1.6;">
                  To complete the setup and verify your store, please upload and send all the required documents for verification.
                </p>
                <p style="font-size: 15px; line-height: 1.6;">
                  Once your documents are verified, your store will be activated and visible to customers.
                </p>
                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Best regards,<br>
                  <strong>The QuickSevere Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSevere. All rights reserved.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>
  `
    )

    if (!ok) {
      return res.status(400).json({
        success: false,
        message: "Error while sending the mail. Store creation rolled back."
      })
    }

  } catch (error) {
    console.error("Error creating store:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error while creating store.",
    })
  }
}

export const getStoreStatus = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
    if (!store) return res.status(404).json({ error: "Store not found" })

    const tz = store.storeTimezone || "Asia/Kolkata"
    const now = DateTime.now().setZone(tz)
    const todayKey = keyByLuxonWeekday(now.weekday)
    const today = store.openingHours?.[todayKey]

    if (store.status === "pending") {
      return res.status(200).json({
        success: false,
        message: "store is not active yet. Please submit the verification request."
      })
    }

    if (store.isDelete || store.status === "suspended") {
      return res.json({
        success: true,
        storeId: store._id,
        storeName: store.storeName,
        currentStatus: {
          timezone: tz,
          localTime: now.toFormat("HH:mm"),
          isOpenNow: false,
          statusMessage: store.isDelete ? "store deleted" : "store suspended",
          persistedStatus: store.status
        }
      });
    }

    let isOpenNow = false
    let statusMessage = "closed today"

    if (today?.enabled && HHMM.test(today.open) && HHMM.test(today.close)) {
      const nowM = now.hour * 60 + now.minute;
      const openM = toMinutes(today.open)
      const closeM = toMinutes(today.close)

      if (openM < closeM) {
        if (nowM >= openM && nowM < closeM) {
          isOpenNow = true;
          statusMessage = `open — closes at ${today.close}`
        } else if (nowM < openM) {
          statusMessage = `closed — opens at ${today.open}`
        } else {
          statusMessage = `closed — opens tomorrow`;
        }
      } else {
        statusMessage = "closed (invalid/overnight hours configured)"
      }
    }


    const desiredStatus = isOpenNow ? "active" : "closed"
    if (store.status !== desiredStatus) {
      store.status = desiredStatus
      await store.save()
    }

    return res.json({
      success: true,
      storeId: store._id,
      storeName: store.storeName,
      currentStatus: {
        timezone: tz,
        localTime: now.toFormat("HH:mm"),
        isOpenNow,
        statusMessage,
        persistedStatus: store.status,
      },
    })
  } catch (error) {
    console.error("Error getting store status:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error." })
  }
}

export const submitVerificationRequest = async (req, res) => {
  try {
    const ownerId = req.user?.id

    if (!ownerId) {
      deleteUploadedFiles(req.files)
      return res.status(400).json({
        success: false,
        message: "Owner id not found."
      })
    }

    const existingRequest = await verificationRequest.findOne({
      storeOwner: ownerId,
      status: "pending",
    })

    if (existingRequest) {
      deleteUploadedFiles(req.files)
      return res.status(400).json({
        success: false,
        message: "You already have a pending verification request.",
      })
    }

    const { aadhaarCard, businessLicense, taxId, proofOfAddress, storePhotos } = req.files

    if (!aadhaarCard || !businessLicense || !taxId || !proofOfAddress || !storePhotos) {
      deleteUploadedFiles(req.files)
      return res.status(400).json({
        success: false,
        message: "Please upload all the documents."
      })
    }

    const adminIds = await User.find({ role: 'admin' }).distinct('_id')

    if (!adminIds.length) {
      deleteUploadedFiles(req.files)
      return res.status(400).json({
        success: false,
        message: "No admin users found to assign."
      })
    }

    const randomAdminIds = adminIds[Math.floor(Math.random() * adminIds.length)]
    const admin = await User.findOne({ _id: randomAdminIds }).select("name")
    const storeId = await Store.findOne({ owner: ownerId }).select("_id")

    if (!storeId) {
      deleteUploadedFiles(req.files)
      return res.status(404).json({
        success: false,
        message: "Store not found."
      })
    }

    const request = await verificationRequest.create({
      storeOwner: ownerId,
      admin: randomAdminIds,
      status: "pending",
      storeId: storeId._id,
      adminName: admin.name
    })

    const uploadOne = async (file) => {
      if (!file?.path) return null
      return uploadOnCloudinary(file.path)
    }

    const aadhaarCardUrl = await uploadOne(aadhaarCard[0])
    const businessLicenseUrl = await uploadOne(businessLicense[0])
    const taxIdUrl = await uploadOne(taxId[0])
    const proofOfAddressUrl = await uploadOne(proofOfAddress[0])
    const storePhotoUrl = await uploadOne(storePhotos[0])

    const update = {
      ...(aadhaarCardUrl && { aadhaarCard: aadhaarCardUrl }),
      ...(businessLicenseUrl && { businessLicense: businessLicenseUrl }),
      ...(taxIdUrl && { taxId: taxIdUrl }),
      ...(proofOfAddressUrl && { proofOfAddress: proofOfAddressUrl }),
      ...(storePhotoUrl && { storePhotos: storePhotoUrl }),
    }

    const updated = await verificationRequest.findByIdAndUpdate(
      request._id,
      { $set: update },
      { new: true }
    )

    return res.status(201).json({
      success: true,
      message: "Verification request submitted.",
      data: updated
    })

  } catch (error) {
    console.error("submitVerificationRequest error:", error)
    deleteUploadedFiles(req.files)
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    })
  }
}

const deleteUploadedFiles = (files) => {
  if (!files) return
  Object.values(files).forEach(fileArray => {
    fileArray.forEach(file => {
      if (file?.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }
    })
  })
}

export const getCurrentStore = async (req, res) => {
  try {
    const userId = req.user?.id

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is missing."
      })
    }

    const store = await Store.findOne({ owner: userId })

    if (!store) {
      return res.status(400).json({
        success: false,
        error: "Store not found."
      })
    }

    return res.status(200).json({
      success: true,
      message:"store id ",
      storeid: store._id
    })

  } catch (error) {

  }
}

export const requestStatus = async (req, res) => {
  try {
    const { status } = req.body
    const loginAdmin = req.user?.id
    const id = req.params?.id


    if (!loginAdmin) {
      return res.status(400).json({
        success: false,
        message: "admin id not found."
      })
    }
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "request id not provided."
      })
    }
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required."
      })
    }


    const requestId = await verificationRequest.findById(id);
    if (!requestId) {
      return res.status(404).json({
        success: false,
        message: "Verification request not found."
      })
    }

    if (String(requestId.admin) !== String(loginAdmin)) {
      return res.status(403).json({
        success: false,
        message: "This request is not assigned to you."
      });
    }


    const requestStatus = await verificationRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );


    if (String(status).toLowerCase() === "accepted") {
      const storeId = requestStatus.storeId;
      if (storeId) {
        await Store.findByIdAndUpdate(storeId, {
          status: "active",
          isVerified: true,
        })
      }
    }
    const storedata = await Store.findById(requestStatus.storeId)

    res.status(200).json({
      success: true,
      message: `Store verification request has been ${status}.`,
      data: requestStatus,
    })

    const ok = await sendMail(
      storedata.storeEmail,
      `Your Store Verification Has Been ${status} — QuickSevere`,
      `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 40px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            <tr>
              <td style="background-color: ${status === "accepted" ? "#28a745" : "#dc3545"
      }; text-align: center; padding: 25px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">QuickSevere ⚡</h1>
              </td>
            </tr>
            <tr>
              <td style="padding: 30px; color: #333333;">
                <h2 style="color: ${status === "accepted" ? "#28a745" : "#dc3545"
      }; margin-top: 0;">
                  Store Verification ${status === "accepted" ? "Approved ✅" : "Reviewed ❌"
      }
                </h2>
                <p style="font-size: 16px;">Hi <strong>${storedata.name}</strong>,</p>
                <p style="font-size: 15px; line-height: 1.6;">
                  ${status === "accepted"
        ? `Great news! Your store on <strong>QuickSevere</strong> has been <strong>approved</strong> and is now <strong>active</strong>. Customers can now find and explore your store.`
        : `We’ve reviewed your store verification request on <strong>QuickSevere</strong>. Unfortunately, it could not be approved at this time. Please check your submitted documents and update any incorrect or missing details before reapplying.`
      }
                </p>
                <p style="font-size: 14px; color: #555555; margin-top: 30px;">
                  Best regards,<br>
                  <strong>The QuickSevere Team</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 13px; color: #777;">
                <p>© ${new Date().getFullYear()} QuickSevere. All rights reserved.</p>
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
      return res.status(400).json({
        success: false,
        message: "Error while sending store status email.",
      });
    }



  } catch (error) {
    console.error("requestStatus ", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong."
    });
  }
};

export const getAdminRequest = async (req, res) => {
  try {
    const adminId = req.user?.id;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: "Admin ID not found in request."
      });
    }

    const requests = await verificationRequest.find({ admin: adminId });

    if (!requests || requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No verification requests found for this admin."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Here are the verification requests.",
      data: requests
    });

  } catch (error) {
    console.error("Error fetching admin requests:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching admin requests.",
    });
  }
};
