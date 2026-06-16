import { type RequestHandler } from "express";

export const  userMiddleware:RequestHandler=(req, res, next)=> {
    const role = req?.user?.role; 
    if (role === "user") {
      return next();
    }else{
       return res
      .status(403)
      .json({ message: "you are not allowed to user pages" }); 
    }
    
}
