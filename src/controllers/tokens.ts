import "dotenv/config";
import jwt from "jsonwebtoken";
 
const ACCESS_SECRET=process.env.ACCESS_SECRET  || "jay balayya";
const REFRESH_SECRET=process.env.REFRESH_SECRET || "jay seethayya";

interface tokenObject {
    email:string,
    role:string,
    userId:number
}
export function generateAccessToken({email,role,userId}:tokenObject){
    const accessToken=jwt.sign({email,role,userId},ACCESS_SECRET,{expiresIn:"1m"});
    return accessToken;
}

export function generateRefreshToken({email,role,userId}:tokenObject){
    const refreshToken=jwt.sign({email,role,userId},REFRESH_SECRET,{expiresIn:"5d"});
    return refreshToken;
}

export function validateAccessToken(accessToken:string){
    try{
        const payload=jwt.verify(accessToken,ACCESS_SECRET);
        return [true,payload]
    }catch(error){
        return [false,null];
    }
}

export function validateRefreshToken(refreshToken:string){
    try{
        const payload=jwt.verify(refreshToken,REFRESH_SECRET);
            return [true,payload]
    }catch(error){
        return [false,null];
    }
}
