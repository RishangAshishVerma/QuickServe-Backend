import uploadOnCloudinary from "../utils/cloudinary.js "
import Store from "../models/store.model.js";
import Product from "../models/product.mode.js"
import User from '../models/user.model.js';
import sendMail from '../utils/nodemailer.js';

export const addProduct = async (req, res) => {
    try {
        const userId = req.user.id
        const storeId = req.params.id

        const { title, description, category, price, currency, stockQuantity, isService, productMedia, ratings, isActive } = req.body

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID not found"
            })
        }
        const user = await User.findById(userId);

        if (!user) {
            return res.status(500).json({
                success: false,
                message: "user data is wrrong or user account has been deleted"
            })
        }

        const store = await Store.findById(storeId)

        if (!store) {
            return res.status(500).json({
                success: false,
                message: "There is no store with that ID or it may be suspended"
            })
        }

        const product = await Product.create({
            storeInfo: storeId,
            createdBy: userId,
            title,
            description,
            category,
            price,
            currency,
            stockQuantity,
            isService,
            location: user.userlocations,
            productMedia,
            ratings,
            isActive,
        })

        return res.status(200).json({
            success: true,
            message: "Product added successfully",
            data: product
        })
    } catch (error) {

        console.log(`error while adding the product ${error}`);

        return res.status(500).json({
            success: false,
            message: "An error occurred"
        })
    }
};