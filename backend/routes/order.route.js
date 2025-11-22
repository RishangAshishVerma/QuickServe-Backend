import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import { acceptOrder, assignRider, createOrder, getOrderById, getStoreOrder, getUserOrder, orderStatus } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create-order/:id", isAuth, createOrder)
orderRouter.post("/order-status/:id", isAuth, orderStatus)
orderRouter.post("/assign-rider/:id", isAuth, assignRider)
orderRouter.post("/accept-order/:id", isAuth, acceptOrder)
orderRouter.get("/get-user-order", isAuth, getUserOrder)
orderRouter.get("/get-store-order", isAuth, getStoreOrder)
orderRouter.get("/get-order-by-id", isAuth, getOrderById)

export default orderRouter