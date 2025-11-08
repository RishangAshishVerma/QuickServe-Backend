import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import { getUserById, searchUsers, suspendUser, unsuspendUser } from "../controllers/user.controllers.js"

const userRouter = express.Router()

userRouter.get("/search-users", isAuth, authorizeRole("support", "admin"), searchUsers)
userRouter.get("/users/:id", isAuth, authorizeRole("support", "admin"), getUserById)
userRouter.post("/suspend-users/:id", isAuth, authorizeRole("admin"), suspendUser)
userRouter.post("/unsuspend-users/:id", isAuth, authorizeRole("admin"), unsuspendUser)

export default userRouter