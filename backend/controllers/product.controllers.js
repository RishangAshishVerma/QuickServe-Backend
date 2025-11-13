import uploadOnCloudinary from "../utils/cloudinary.js "
import Store from "../models/store.model.js";
import Product from "../models/product.model.js"
import User from '../models/user.model.js';
import sendMail from '../utils/nodemailer.js';

export const addProduct = async (req, res) => {
    try {
        const userId = req.user?.id
        const storeId = req.params?.id
        const productMedia = req.files?.map(f => f.path) || [];

        const { title, description, category, price, currency, stockQuantity, isService, ratings, isActive, } = req.body

        if (!title || !description || !category || !price) {
            return res.status(400).json({
                success: false,
                message: "Required fields are missing (title, description, category, price)."
            });
        }

        if (price < 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be a positive number."
            });
        }

        if (!productMedia) {
            return res.status(400).json({
                success: false,
                message: "no file found."
            });
        }

        if (!productMedia.length) {
            return res.status(400).json({
                success: false,
                message: "No file found."
            });
        }

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
            productMedia: [],
            ratings,
            isActive,
        })

        res.status(200).json({
            success: true,
            message: "Product created. Media is uploading in background",
            data: product
        })

        try {

            (async () => {
                try {
                    let productmedia = [];

                    if (req.files?.length) {
                        for (const file of req.files) {
                            const uploadedUrl = await uploadOnCloudinary(file.path);
                            if (uploadedUrl) {
                                productmedia.push(uploadedUrl);
                            }
                        }
                    }

                    await Product.findByIdAndUpdate(product._id, {
                        productMedia: productmedia
                    });

                    console.log("Background Cloudinary upload completed");

                } catch (err) {
                    console.error("Background upload error", err);
                }
            })();

        } catch (error) {
            console.error("Background upload error", error);
        }


    } catch (error) {

        console.log(`error while adding the product ${error}`);

        return res.status(500).json({
            success: false,
            message: "An error occurred"
        })
    }
};  