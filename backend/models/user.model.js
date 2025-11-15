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
        enum: ["user", "rider", "storeOwner", "support", "admin"],
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

    address: {
        type: String,
        trim: true
    },

    userlocation: {
    type: {
        type: String,
        enum: ["Point"],
    },
    coordinates: {
        type: [Number],
        required: true
    }
},

    suspend: {
    type: Boolean,
    default: false
},

    suspendedReason: {
    type: String,
},

}, { timestamps: true })

userSchema.index({ storeLocation: "2dsphere" })
userSchema.index({ owner: 1 })

const User = mongoose.model("user", userSchema)
export default User