import dotenv from "dotenv";
dotenv.config();

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./config/connectDb.js";
import authRouter from "./routes/auth.route.js";
import meRouter from "./routes/me.routes.js";
import userRouter from "./routes/user.route.js";
import storeRoute from "./routes/store.route.js";
import productRouter from "./routes/prooduct.route.js";

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(
  cors({
    origin: (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean) || '*',
    credentials: true,
  })
)

app.use(helmet());
app.use(morgan("dev"))
app.use(cookieParser())


connectDb()

app.use("/auth/api/v1",authRouter)
app.use("/me/api/v1",meRouter)
app.use("/user/api/v1",userRouter)
app.use("/store/api/v1",storeRoute)
app.use("/product/api/v1",productRouter)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
