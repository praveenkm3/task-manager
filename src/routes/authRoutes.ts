import { Router } from "express";
import {register,login, logout,forgotPassword,verifyOtp,changePassword} from "../controllers/authController.ts"
const router=Router();

router.post('/register',register);
router.post('/login',login);
router.post('/logout',logout);
router.post('/forgot',forgotPassword);
router.post('/verify-otp',verifyOtp);
router.post('/change-password',changePassword);

export default router;


