import type { RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";

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
  const result=await AppDataSource.getRepository(Tasks)
  .createQueryBuilder('tasks')
  .innerJoinAndSelect("tasks.createdUser","createdUser")
  .innerJoinAndSelect("tasks.assignedUser","assignedUser")
  .where("createdUser.userId=:currentUserID",{currentUserID:req.user.userId})
  .getMany();

  return res.status(200).json(result);
}
