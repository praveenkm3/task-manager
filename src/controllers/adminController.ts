import type { RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";
import { Users } from "../models/User.ts";
export const addTask: RequestHandler = async (req, res) => {
  if (!req.body) {
    return res.status(200).json({ message: "All task details required" });
  }
  const { title, description, assigned_user_id } = req.body;
  const admin = req.user;
  const result = await AppDataSource.createQueryBuilder()
    .insert()
    .into(Tasks)
    .values([
      {
        title: title,
        description: description,
        assignedUser: assigned_user_id,
        createdUser: admin.userId,
      },
    ])
    .execute();
  if (result.identifiers.length > 0) {
    return res
      .status(201)
      .json({ message: `${title} created by ${admin?.email}` });
  } else {
    return res.status(400).json({ message: "Task not inserted" });
  }
};

export const fetchTasks:RequestHandler=async (req,res)=>{
  // return res.json({"hello":"bye"})
 const {id}=req.params;
//  console.log(id);
  const user=req.user;
  if(id){
  const result = await AppDataSource.getRepository(Tasks).find({
    where: {
      createdUser:{
        userId: user.userId  
      } ,
      taskId:id
    },
    relations: {    
        assignedUser: true   
    }
  });
  if(result.length<=0){
    return res.status(200).json({"message":"Task not Existed on your UserID"});
  }
  const values={
    taskId:result[0]?.taskId,
    title:result[0]?.title,
    assigned_email:result[0]?.assignedUser.email,
    
  }
  return res.status(200).json(result);
}
 else{
   const result=await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('tasks')
  .innerJoinAndSelect("tasks.createdUser","createdUser")
  .innerJoinAndSelect("tasks.assignedUser","assignedUser")
  .where("createdUser.userId=:currentUserID",{currentUserID:req.user.userId})
  .getMany();

  return res.status(200).json(result);
 }
}

export const fetchUsers:RequestHandler=async(req,res)=>{
  const users=await AppDataSource.getRepository(Users).find(
    {
      where:{
        role:"user"
      }
    }
  )
  // console.log(users);
  return res.status(200).json(users);
}

export const updateTask:RequestHandler=async(req,res)=>{
  
  if (!req.body) {
    return res.status(200).json({ message: "All task details required" });
  }
  const { taskId,title, description, assigned_user_id } = req.body;
  const admin = req.user;
  console.log(req.body);
  const checking1=await AppDataSource.getRepository(Tasks).find({
    where:{
      taskId:taskId,
      createdUser:{
        userId:admin.userId
      }

    }
  })
  // return res.json(checking1)
  if(checking1.length<=0){
    return res.status(200).json({"message":"No matched Tasks"})
  }
  
 
  const result = await AppDataSource.createQueryBuilder()
    .update(Tasks)
    .set({
        title: title,
        description: description,
        assignedUser: assigned_user_id,
        status:"pending",
        createdUser: admin.userId,
    })
    .where(
      "taskId=:ID",{ID:taskId}
    )
    .execute();
      return res
      .status(201)
      .json({ message: `${title} updated by ${admin?.email}` });
  
}

export const deleteTask:RequestHandler=async(req,res)=>{
if (!req.body) {
    return res.status(200).json({ message: "All task details required" });
  }
  const { taskId } = req.body;
  const admin = req.user;
  const checking1=await AppDataSource.getRepository(Tasks).find({
    where:{
      taskId:taskId,
      createdUser:{
        userId:admin.userId
      }

    }
  })
  // return res.status(200).json(checking1)
  if(checking1.length>0){
    const result=await AppDataSource.createQueryBuilder()
    .delete()
    .from(Tasks)
    .where("taskId=:id",{id:taskId})
    .execute();
    return res.status(200).json(result);
  }else{
    return res.status(200).json({"message":"No matched Records"})
  }
 }
//fetch-task-status
export const fetchStatusTasksAdmin:RequestHandler=async (req,res)=>{ 
  const user=req.user;
  const result = await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('task')
  .select("status","taskStatusCount")
  .addSelect("COUNT(task.taskId)","count")
  .innerJoin("task.createdUser",'user')
  .where("user.userId = :userId", { userId: user.userId })
  .groupBy("task.status")
  .getRawMany();
     
return res.status(200).json(result);

}
//fetch-task-user
export const fetchAdminAssignedTasks:RequestHandler=async (req,res)=>{
  const user=req.user;
  const result=await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('task')
  .innerJoinAndSelect("task.assignedUser","assignedUser")
  .select([
     "assignedUser.email","task.status"
  ])
  .addSelect("COUNT(task.taskId)","totalTasks")
  .where("task.created_user_id= :userId",{userId:user.userId})
  .groupBy("assignedUser.email, task.status")
  .execute();
  return res.status(200).json(result);

}