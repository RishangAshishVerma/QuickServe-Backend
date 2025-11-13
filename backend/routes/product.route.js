import express from "express"
import { validateUser } from "../validations/auth.validation.js"
import upload from "../utils/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { addProduct } from "../controllers/product.controllers.js"


const productRouter = express.Router()

    productRouter.post("/add-product/:id", isAuth, upload.array('productMedia', 10), addProduct)


export default productRouter