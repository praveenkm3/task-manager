import { type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { Users } from "../models/User.ts";
import { AppDataSource } from "../config/db.ts";
import { generateAccessToken,generateRefreshToken } from "./tokens.ts";
const ADMIN_SECRET_KEY = 1111;

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
      const result=await AppDataSource
      .createQueryBuilder()
      .insert()
      .into(Users)
      .values(
        {
          email : email,
          userName : username,
          password : hashPassword
        }
      )
      .execute()
      console.log(result);
      return res
        .status(201)
        .json({ message: `user registered succussfully ${email}` });
    } else {
      if (parseInt(adminSecretKey) === ADMIN_SECRET_KEY) { 
        const hashPassword = await bcrypt.hash(password, 10);
        const result=await AppDataSource
        .createQueryBuilder()
        .insert()
        .into(Users)
        .values({
          email : email,
          userName : username,
          password : hashPassword,
          role:"admin"
        }).execute(); 
        return res.status(201).json({ message: `admin registered succussfully ${email}` });
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
  const { email, password} = req.body;
  const getUser = await Users.findOneBy({
    email: email,
  });
  const userId=getUser?.userId;
  if(userId){
    const role=getUser?.role;
    const userPassword=getUser?.password; 
    const checkPassword=await bcrypt.compare(password,userPassword);
    if(checkPassword){
        const accessToken=await generateAccessToken({email,role,userId});
        const refreshToken=await generateRefreshToken({email,role,userId});
        
        res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({"message":` ${getUser?.role} Login succussful ${email} `})
    }else{
        return res.status(401).json({"message":"Incorrect Password"});
    }
  }else{
    return res.status(401).json({"message":"User not existed Register First"});
  }
}
