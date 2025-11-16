
import Cart from "../models/cart.model.js"

export const createCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const storeId = req.params.storeId;
        const productId = req.params.productId;
        const quantity = 1;

        if (!storeId) {
            return res.status(400).json({
                success: false,
                message: "storeId is required"
            });
        }

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required"
            });
        }

        const cart = await Cart.create({
            storeId,
            userId,
            products: [
                {
                    productId,
                    quantity
                }
            ]
        });

        return res.status(201).json({
            success: true,
            message: "Cart created successfully",
            cart
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
}

export const updateCart = async (req,res) => {
    try {
        
    } catch (error) {
        
    }
}
    