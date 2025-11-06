import express from "express"
import { validateUser } from "../validations/auth.validation.js"
import { deleteAccount, signIn, signOut, signup } from "../controllers/auth.contollers.js"
import upload from "../utils/multer.js"
import isAuth from "../middleware/isAuth.middleware.js"


const authRouter = express.Router()

authRouter.post("/signup", upload.single('avatar'), validateUser, signup);
authRouter.post("/signin", signIn);
authRouter.post("/signout", signOut);
authRouter.delete("/delete-account", isAuth, deleteAccount);

export default authRouter