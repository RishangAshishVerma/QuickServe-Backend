import mongoose from "mongoose"

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
        enum: ["user", "rider", "warehouseOwner", "support", "admin"],
        default: "user"
    },

    isDelete: {
        type: Boolean,
        default: false
    },

    otp: {
        code: { type: String },
        expiresAt: { type: Date },
    },

    suspend: {
        type: Boolean,
        default: false
    },

    suspendedReason: {
        type: String,   
    },

}, { timestamps: true })

const User = mongoose.model("user", userSchema)
export default User