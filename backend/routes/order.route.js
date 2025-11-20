import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import { acceptOrder, assignRider, createOrder, orderStatus } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create-order/:id", isAuth, createOrder)
orderRouter.post("/order-status/:id", isAuth, orderStatus)
orderRouter.post("/assign-rider/:id", isAuth, assignRider)
orderRouter.post("/accept-order/:id", isAuth, acceptOrder)

export default orderRouter