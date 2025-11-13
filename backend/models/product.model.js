import mongoose, { Mongoose } from "mongoose";

const productSchema = new mongoose.Schema(
    {
        storeInfo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            enum: [
                "food",
                "fashion",
                "digital",
                "service",
                "beauty",
                "education",
                "other",
            ],
            default: "other",
        },

        price: {
            type: Number,
            required: true,
        },

        currency: {
            type: String,
            default: "USD",
        },

        stockQuantity: {
            type: Number,
            default: 0,
        },

        isService: {
            type: Boolean,
            default: false,
        },

        attributes: {
            type: Object,
            default: {},
        },

        productMedia: [
            {
                type: String,
            },
        ],

        ratings: {
            average: {
                type: Number,
                default: 0
            },
            count: {
                type: Number
                , default: 0
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        isDelist: {
            type: Boolean,
            default: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;