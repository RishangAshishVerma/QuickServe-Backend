import express from "express"
import upload from "../utils/multer.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { addProduct, deletedProduct, getAllProduct } from "../controllers/product.controllers.js"


const productRouter = express.Router()

productRouter.post("/add-product/:id", isAuth, upload.array('productMedia', 10), authorizeRole("storeOwner", "admin"), addProduct)
productRouter.delete("/deleted-product/:id", isAuth, authorizeRole("storeOwner", "admin"), deletedProduct)
productRouter.get("/get-all-product/:id", isAuth, authorizeRole("storeOwner", "admin"), getAllProduct)


export default productRouter