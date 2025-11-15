import express from "express"
import { createStore, getStoreStatus, submitVerificationRequest, requestStatus, getAdminRequest, getCurrentStore, getNearbyStores } from "../controllers/store.controllers.js"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import upload from "../utils/multer.js"



const storeRoute = express.Router()

storeRoute.post("/create-store", isAuth, authorizeRole("storeOwner"), createStore)
storeRoute.get("/store-status/:id", getStoreStatus)
storeRoute.post("/verification-request", isAuth, authorizeRole("storeOwner"), upload.fields([
    { name: 'aadhaarCard', maxCount: 1 },
    { name: 'businessLicense', maxCount: 1 },
    { name: 'taxId', maxCount: 1 },
    { name: 'proofOfAddress', maxCount: 1 },
    { name: 'storePhotos', maxCount: 1 }
]), submitVerificationRequest)
storeRoute.post("/request-status/:id", isAuth, authorizeRole("admin"), requestStatus)
storeRoute.get("/get-admin-request", isAuth, authorizeRole("admin"), getAdminRequest)
storeRoute.get("/current-store" , isAuth , authorizeRole("storeOwner"),getCurrentStore)
storeRoute.get("/get-near-by-stores",isAuth,getNearbyStores)

export default storeRoute