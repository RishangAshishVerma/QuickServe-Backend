import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import { createOrder, orderStatus } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create-order/:id" , isAuth, createOrder)
orderRouter.post("/order-status/:id" , isAuth, orderStatus)

export default orderRouter