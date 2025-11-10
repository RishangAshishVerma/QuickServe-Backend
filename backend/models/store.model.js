import mongoose from "mongoose";

const HHMM = /^([01]\d|2[0-3]):([0-5]\d)$/;

const daySchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: true
    },

    open: {
        type: String,
        default: "09:00",
        validate: { validator: v => HHMM.test(v), message: 'open must be "HH:mm"' }
    },

    close: {
        type: String,
        default: "18:00",
        validate: { validator: v => HHMM.test(v), message: 'close must be "HH:mm"' }
    }
}, { _id: false });


const storeSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    storeName: {
        type: String,
        required: true,
        trim: true
    },

    storeTimezone: {
        type: String,
        required: true,
        default: "Asia/Kolkata"
    },

    storeLocation: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (arr) =>
                    Array.isArray(arr) &&
                    arr.length === 2 &&
                    arr[0] >= -180 && arr[0] <= 180 &&
                    arr[1] >= -90 && arr[1] <= 90,
                message: "coordinates must be [lng, lat]"
            }
        }
    },

    openingHours: {
        monday: { type: daySchema },
        tuesday: { type: daySchema },
        wednesday: { type: daySchema },
        thursday: { type: daySchema },
        friday: { type: daySchema },
        saturday: { type: daySchema },
        sunday: { type: daySchema }
    },

    isVerified: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ["active", "suspended", "closed","pending"],
        default: "pending",
        index: true
    },

    isDelete: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

storeSchema.index({ storeLocation: "2dsphere" })
storeSchema.index({ owner: 1 })

const Store = mongoose.model("Store", storeSchema)
export default Store