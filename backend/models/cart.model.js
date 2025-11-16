import mongoose from "mongoose"

const cartSchema = new mongoose.Schema({
    storeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Store"
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    products: [
        {
            _id: false,
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
});

const Cart = mongoose.model("cart", cartSchema)

export default Cart