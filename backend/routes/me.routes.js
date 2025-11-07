import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import { getUser, updateUserDetails } from "../controllers/me.contollers.js"

const meRouter = express.Router()

meRouter.get("/me" , isAuth, getUser)
meRouter.patch("/update-details" , isAuth, updateUserDetails)

export default meRouter