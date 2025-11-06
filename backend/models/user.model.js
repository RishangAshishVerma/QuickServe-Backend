import mongoose from "mongoose"

const userSchema = mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
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


}, { timestamps: true })

const User = mongoose.model("user", userSchema)
export default User