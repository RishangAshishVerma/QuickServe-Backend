import express from "express"
import { validateUser } from "../validations/auth.validation.js"
import { signup } from "../controllers/auth.contollers.js"
import upload from "../utils/multer.js"


const authRouter =  express.Router()

authRouter.post("/signup", upload.single('avatar'), validateUser, signup);

export default authRouter