import express from "express"
import { createStore, getStoreStatus } from "../controllers/store.controllers.js"


const storeRoute = express.Router()

storeRoute.post("/create-store",createStore)
storeRoute.get("/store-status/:id",getStoreStatus)

export default storeRoute