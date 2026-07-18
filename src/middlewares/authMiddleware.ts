import {type RequestHandler } from "express";
import { decryptToken } from "../controllers/authController.ts"; 
import { validateAccessToken } from "../controllers/tokens.ts";


export const authMiddleware:RequestHandler=(req,res,next)=>{  
const accessToken=req?.cookies?.accessToken;
try {
    const decrypt=decryptToken(accessToken);
    const verifyUser=validateAccessToken(decrypt);
    if(verifyUser[0]){
    req.user=verifyUser[1] as object; 
    return next();
}else{
    return res.status(401).json({"message":"access token expired"});
}
} catch (error) {
    return res.status(401).json({"message":"Token MisMatch"});
}


}