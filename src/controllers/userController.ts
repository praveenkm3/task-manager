import { type RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";


export const fetchTasks: RequestHandler = async (req, res) => {
  const {id}=req.params;
  const user=req.user;
  if(!id){
  const result = await AppDataSource.getRepository(Tasks)
    .createQueryBuilder("task")  
    .innerJoinAndSelect("task.createdUser", "createdUser")  //createdUser holds Users table
    .innerJoinAndSelect("task.assignedUser", "assignedUser")  //assignedUser holds Users table
    .where("assignedUser.userId = :currentUserId", { currentUserId: user.userId })
    .getMany();
  return res.status(200).json(result);
  }
  else{
    let result=await AppDataSource.getRepository(Tasks)
    .createQueryBuilder('task')
    .innerJoinAndSelect("task.createdUser","createdUser")
    .innerJoinAndSelect("task.assignedUser","assignedUser")
    .where("assignedUser.userId=:currentUserId",{currentUserId:user.userId})
    .andWhere("task.taskId=:currentTaskId",{currentTaskId:parseInt(id)})
    .getMany();
    res.status(200).json(result);
  }
}




