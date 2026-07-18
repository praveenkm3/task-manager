import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto"; 
import { Users } from "../models/User.ts";
import { AppDataSource } from "../config/db.ts";
import "dotenv/config";
import {
  generateAccessToken,
  generateRefreshToken,
  validateRefreshToken,
  validateAccessToken,
} from "./tokens.ts";

import sendEmail from "../mailer/sendEmail.ts";



const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY;

const CookieSecretKey=process.env.CookieSecretKey;
const ALGORITHM=process.env.ALGORITHM;

export async function register(req: Request, res: Response) {
  if (!req.body) {
    return res.status(200).json({ message: "Must fill all details" });
  }
  const { username, email, password, adminSecretKey = "user" } = req.body;
  const userExisted = await Users.findOneBy({
    email: email,
  });
  if (!userExisted) {
    if (adminSecretKey === "user") {
      const hashPassword = await bcrypt.hash(password, 10);
      const result = await AppDataSource.createQueryBuilder()
        .insert()
        .into(Users)
        .values({
          email: email,
          userName: username,
          password: hashPassword,
        })
        .execute();
      // console.log(result);
      return res
        .status(201)
        .json({ message: `user registered succussfully ${email}` });
    } else {
      if (adminSecretKey === ADMIN_SECRET_KEY) {
        const hashPassword = await bcrypt.hash(password, 10);
        const result = await AppDataSource.createQueryBuilder()
          .insert()
          .into(Users)
          .values({
            email: email,
            userName: username,
            password: hashPassword,
            role: "admin",
          })
          .execute();
        return res
          .status(201)
          .json({ message: `admin registered succussfully ${email}` });
      } else {
        return res.status(401).json({ message: "Invalid Admin key" });
      }
    }
  } else {
    return res.status(401).json({ message: "user already existed" });
  }
}
export async function login(req: Request, res: Response) {
  if (!req.body) {
    return res.status(200).json({ message: "Must fill all details" });
  }
  const { email, password } = req.body;
  const getUser = await Users.findOneBy({
    email: email,
  });
  const userId = getUser?.userId;
  if (userId) {
    const role = getUser?.role;
    const userPassword = getUser?.password;
    const checkPassword = await bcrypt.compare(password, userPassword);
    if (checkPassword) {
      const accessToken = await generateAccessToken({ email, role, userId });
      const refreshToken = await generateRefreshToken({ email, role, userId });

      const accessTokenEncrypt = encryptToken(accessToken);
      const refreshTokenEncrypt = encryptToken(refreshToken);
      
      res.cookie("accessToken", accessTokenEncrypt, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshTokenEncrypt, {
        httpOnly: true,
        maxAge: 5 * 24 * 60 * 60 * 1000,
      });
      // console.log(refreshToken);
      return res
        .status(200)
        .json({ role: `${getUser?.role}`, email: `${email}` });
    } else {
      return res.status(401).json({ message: "Incorrect Password" });
    }
  } else {
    return res.status(401).json({ message: "User not existed Register First" });
  }
}
export async function refresh(req: Request, res: Response) {
  // console.log(req.user);
  const accessToken = req?.cookies?.accessToken;
  const refreshToken = req?.cookies?.refreshToken;
  const accessTokenDecrypt=decryptToken(accessToken);
  const verifyAccess = validateAccessToken(accessTokenDecrypt);
  if (verifyAccess[0]) {
    // console.log("Access token not expired");
    return res.status(201).json(verifyAccess[1]);
  } else {
    // console.log("Access token expired");

  const refreshTokenDecrypt=decryptToken(refreshToken);
    const verifyRefresh = validateRefreshToken(refreshTokenDecrypt);
    if (verifyRefresh[0]) {
      // console.log("refresh token not expired");

      const payload = verifyRefresh[1];
      const newAccess = await generateAccessToken(payload);
      const accessTokenEncrypt = encryptToken(newAccess);
      res.cookie("accessToken", accessTokenEncrypt, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
      });
      // console.log("new access token created");
      return res.status(201).json(payload);
    } else {
      // console.log("Tokens expired");
      return res.status(401).json({ message: "Tokens Expired" });
    }
  }
}
export async function logout(req: Request, res: Response) {
  res.clearCookie("accessToken", {
    httpOnly: true,
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
  });
  // console.log("Log out success");
  return res.status(200).json({ message: "Logout succussfully" });
}
export async function forgotPassword(req: Request, res: Response){

  try { 
    const email=req?.body?.email;
    const checkEmail=await Users.findOneBy({
      email:email
    });
    if(!checkEmail?.email){
      return res.status(200).json("Not Registered");
    }else{
      const MOTP=Math.floor(1000 + Math.random() * 9000);
      await sendEmail(email,MOTP);
       req.session.resetOtp = {
        email,
        MOTP,
    expiresAt: Date.now() + 1 * 60 * 1000
  };
      return res.status(201).json({"message":"OTP generated Successfully"})
    }
    
  } catch (error) {
    return "Invalid Operation";
  }
}
export async function verifyOtp(req: Request, res: Response){
    try {
       const {otp,uemail} = req.body;
       const MOTP=String(req?.session?.resetOtp?.MOTP);
       const email=req?.session?.resetOtp?.email;
       if(otp===MOTP && uemail===email){
        // delete req.session.resetOtp;
        return res.status(200).json({"message":"OTP Verified "});
       }else{
        return res.status(400).json({"message":"OTP Not Verified"});
       }

    } catch (error) {
      return res.status(400).json("Invalid Verification");
    }
}
export async function changePassword(req: Request, res: Response){
    try {
       const {uemail,password} = req.body;
       const email=req?.session?.resetOtp?.email;
       if(uemail===email){
        const getUser = await Users.findOneBy({
        email: email,
        });
        const userPassword=getUser?.password;
        const checkPassword = await bcrypt.compare(password, userPassword);
        if(checkPassword){
          return res.status(200).json({"message":"SamePasswordEntered"});
        }
        delete req.session.resetOtp;
        const hashPassword = await bcrypt.hash(password, 10);
        const result = await AppDataSource.createQueryBuilder()
                .update(Users)
                .set({
                  password: `${hashPassword}`,
                })
                .where("email = :email", { email: email })
                .execute();
        // console.log(result);
        return res.status(200).json({"message":"Generated New Password"});
       }else{
        return res.status(400).json({"message":"Not Generated New Password"});
       }
    } catch (error) {
      return res.status(400).json("Invalid Verification");
    }
}
export function encryptToken(token:any) {
    try {
      const iv = crypto.randomBytes(12); 
    const cipher = crypto.createCipheriv(ALGORITHM, CookieSecretKey, iv);
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
      return "Tokens Invalid";
    }
}
export function decryptToken(cookieValue:any) {
    try {
      const [ivHex, authTagHex, encryptedHex] = cookieValue.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, CookieSecretKey, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted; 
    } catch (error) {
      return "Tokens Invalid";
    }
}