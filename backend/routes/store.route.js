import express from "express"
import { createStore, getStoreStatus } from "../controllers/store.controllers.js"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"


const storeRoute = express.Router()

storeRoute.post("/create-store", isAuth, authorizeRole("storeOwner"), createStore)
storeRoute.get("/store-status/:id", getStoreStatus)


export default storeRoute