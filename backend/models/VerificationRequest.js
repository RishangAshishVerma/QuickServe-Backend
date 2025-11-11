import mongoose from "mongoose"
import { type } from "os"

const verificationRequestSchema = new mongoose.Schema({

    storeOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    
    storeId: {
        type: String
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    status: {
        type: String,
        enum: ['accepted', 'pending', 'rejected'],
        default: 'pending'
    },

    aadhaarCard: {
        type: String,
    },

    businessLicense: {
        type: String,
    },

    taxId: {
        type: String,
    },

    proofOfAddress: {
        type: String,
    },

    storePhotos: {
        type: String,
    },


}, { timestamps: true })

const verificationRequest = mongoose.model("verificationRequest", verificationRequestSchema)

export default verificationRequest