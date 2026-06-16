import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.ts";
import userRoutes from "./routes/userRoutes.ts";
import adminRoutes from "./routes/adminRoutes.ts";
import { AppDataSource } from "./config/db.ts";
import { authMiddleware } from "./middlewares/authMiddleware.ts"; 
import { adminMiddleware } from "./middlewares/adminMiddleware.ts";
import {userMiddleware} from "./middlewares/userMiddleware.ts"


const PORT=process.env.PORT;
const app=express();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(cookieParser());
app.use('/api/',authRoutes);
app.use(authMiddleware);
app.use('/user/',userMiddleware,userRoutes)
app.use('/admin/',adminMiddleware,adminRoutes);



try {
    await AppDataSource.initialize();
    console.log("database connected");

    app.listen(PORT,()=>{
    console.log(`http://localhost:${PORT}`)
});
} catch (error) {
    console.error("Connection failed:", error);
}



