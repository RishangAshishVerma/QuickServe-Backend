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

export const StorelocationSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true,
        },
    },
    { _id: false }
);


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

    storeEmail: {
        type: String
    },

    storeTimezone: {
        type: String,
        required: true,
        default: "Asia/Kolkata"
    },

    storeLocation: StorelocationSchema,

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
        enum: ["active", "suspended", "closed", "pending"],
        default: "pending",
        index: true
    },

    isDelete: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

storeSchema.index({ storeLocation: "2dsphere" })

const Store = mongoose.model("Store", storeSchema)
export default Store