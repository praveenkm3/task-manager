import { type RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";


export const fetchTasks: RequestHandler = async (req, res) => {
  const {id}=req.params;
  const user=req.user;
  if(!id){
  const result = await AppDataSource.getRepository(Tasks).find({
    where: {
      assignedUser:{
        userId: user.userId  
      } 
    },
    relations: {
        createdUser: true,    
        assignedUser: true   
    }
});

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

export const updateTask:RequestHandler = async (req, res) => {
//  console.log(req.body);
  const {id,status}=req.body;
  const user=req.user;
  // console.log(user);
  const checkUserTask=await AppDataSource.getRepository(Tasks).find({
    where:{
      assignedUser:{
        userId:user.userId 
      },
      taskId:id
    }
  })
  // console.log(checkUserTask);
  if(checkUserTask.length<=0){
return res.status(401).json({"message":"Unauthorized Attemt to modify tasks"})
  }else{
const result=await AppDataSource
  .createQueryBuilder()
  .update(Tasks)
  .set({
    status:`${status}`
  })
  .where("taskId = :ID",{ID:id})
  .execute();
  // console.log(result);
  return res.status(200).json({"message":"Update success"})
  }
  
  
  
}

export const fetchStatusTasks:RequestHandler=async (req,res)=>{ 
  const user=req.user;
  const result = await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('task')
  .select("status","taskStatusCount")
  .addSelect("COUNT(task.taskId)","count")
  .innerJoin("task.assignedUser",'user')
  .where("user.userId = :userId", { userId: user.userId })
  .groupBy("task.status")
  .getRawMany();
     
return res.status(200).json(result);

}

// select created_user_id,count(created_user_id) from tasks
//  where "assigned_user_id"=23
//  group by (created_user_id);

export const fetchAdminCreatedTasks:RequestHandler=async (req,res)=>{
  const user=req.user;
  const result=await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('task')
  .innerJoinAndSelect("task.createdUser","createdUser")
  .select([
     "createdUser.email","task.status"
  ])
  .addSelect("COUNT(task.taskId)","totalTasks")
  .where("task.assigned_user_id= :userId",{userId:user.userId})
  .groupBy("createdUser.email, task.status")
  .execute();
  return res.status(200).json(result);

}
 