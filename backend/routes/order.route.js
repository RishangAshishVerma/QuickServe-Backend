import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import { createOrder } from "../controllers/order.controllers.js"

const orderRouter = express.Router()

orderRouter.post("/create-order/:id" , isAuth, createOrder)

export default orderRouter