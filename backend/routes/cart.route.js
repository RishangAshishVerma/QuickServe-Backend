import express from "express"
import upload from "../utils/multer.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { createCart, updateCart } from "../controllers/cart.controllers.js"


const cartRouter = express.Router()

cartRouter.post("/createcart/:storeId/:productId", isAuth, createCart)
cartRouter.patch("/updatecart/:cartId/:productId", isAuth, updateCart)

export default cartRouter