import mongoose from "mongoose"
import {locationSchema} from "../models/user.model.js"
import {StorelocationSchema} from "../models/store.model.js"

const orderSchema = new mongoose.Schema(
    {
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            required: true,
        },

        pickUpLocation: StorelocationSchema,

        deliveryLocation: locationSchema,

        totalPrice: {
            type: Number,
            default: 0,
            required: true,
        },

        deliveryBoyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: ["pending", "accepted", "on_the_way", "delivered", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

orderSchema.index({ pickUpLocation: "2dsphere" });
orderSchema.index({ deliveryLocation: "2dsphere" });

orderSchema.index({ deliveryBoyId: 1 });
orderSchema.index({ storeId: 1 });

const Order = mongoose.model("Order", orderSchema)
export default Order