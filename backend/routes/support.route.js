import express from "express"
import isAuth from "../middleware/isAuth.middleware.js"
import authorizeRole from "../middleware/AuthizeRole.middlleware.js"
import { reorder } from "../controllers/support.controllers.js"

const supportRoute = express.Router()

supportRoute.post("/support-staff-place-order" , isAuth, authorizeRole(support), reorder )