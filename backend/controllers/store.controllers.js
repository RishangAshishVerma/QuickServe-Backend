import Store from "../models/store.model.js";
import { DateTime } from "luxon"; 

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
            owner,
            storeName,
            storeTimezone = "Asia/Kolkata",
            storeLocation,
            openingHours,
        } = req.body

        if (!owner) {
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
            return res.status(400).json({ success: false, message: "Opening hours must be an object." })
        }

        const normalizedHours = normalizeOpeningHours(openingHours)

        const store = await Store.create({
            owner,
            storeName: storeName.trim(),
            storeTimezone,
            storeLocation,
            openingHours: normalizedHours,
            isVerified: false,
            status: "pending",
        })

        return res.status(201).json({
            success: true,
            message: `Store "${storeName}" created successfully.`,
        })

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
        persistedStatus: store.status
      }
    })
  } catch (error) {
    console.error("Error getting store status:", error);
    return res.status(500).json({ success: false, error: error.message || "Internal server error." })
  }
};