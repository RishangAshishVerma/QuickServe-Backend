import mongoose from "mongoose"

export const locationSchema = new mongoose.Schema(
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

const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },

    phoneNo: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    avatar: {
        type: String,
        // required: true,
    },

    role: {
        type: String,
        enum: ["user", "rider", "storeOwner", "support", "admin"],
        default: "user"
    },

    isDelete: {
        type: Boolean,
        default: false
    },

    isAvailable: {
        type: Boolean,
        default: false
    },

    address: {
        type: String,
        trim: true
    },

    userlocation: locationSchema,

    suspend: {
        type: Boolean,
        default: false
    },

    suspendedReason: {
        type: String,
    },

}, { timestamps: true })

userSchema.index({ userlocation: "2dsphere" });


const User = mongoose.model("user", userSchema)
export default User