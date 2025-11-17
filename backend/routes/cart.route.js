import express from "express"
import upload from "../utils/multer.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import isAuth from "../middleware/isAuth.middleware.js"
import { clearCart, createCart, getCartById, updateCart } from "../controllers/cart.controllers.js"


const cartRouter = express.Router()

cartRouter.post("/createcart/:storeId/:productId", isAuth, createCart)
cartRouter.patch("/updatecart/:cartId/:productId", isAuth, updateCart)
cartRouter.get("/get-cart-by-id", isAuth, getCartById)
cartRouter.get("/clear-cart", isAuth, clearCart)

export default cartRouter