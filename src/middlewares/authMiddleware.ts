import {type RequestHandler } from "express";

import { validateAccessToken } from "../controllers/tokens.ts";
export const authMiddleware:RequestHandler=(req,res,next)=>{

const accessToken=req?.cookies?.accessToken;
const verifyUser=validateAccessToken(accessToken);
if(verifyUser[0]){
    req.user=verifyUser[1] as object; 
    return next();
}else{
    return res.status(401).json({"message":"access token expired"});
}
}