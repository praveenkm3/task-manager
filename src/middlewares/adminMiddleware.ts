import { type RequestHandler } from "express";

export const  adminMiddleware:RequestHandler=(req, res, next)=> {
    const role = req?.user?.role; 
    if (role === "admin") {
      return next();
    }else{
       return res
      .status(403)
      .json({ message: "you are not allowed to admin pages" }); 
    }
    
}
