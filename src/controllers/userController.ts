import { type RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";
import { Users } from "../models/User.ts";

export const fetchTasksLength: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user details Required." });
    }
    const counts = await AppDataSource.getRepository(Tasks).find({
      where: {
        assignedUser: {
          userId: user.userId,
        },
      },
    });
    return res.status(200).json({ length: counts?.length || 0 });
  } catch (error) {
    return res.status(400).json({ "Error at fetching length": error });
  }
};
export const fetchTasks: RequestHandler = async (req, res) => {
  try {
    console.log(req.body);
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user details Required." });
    }
    const {
      filterColumn,
      filterValue,
      filterOperator,
      page,
      records,
      sortColumnName = undefined,
      sortOrder = undefined,
    } = req.body;

    const query = AppDataSource.getRepository(Tasks)
      .createQueryBuilder("tasks")
      .leftJoinAndSelect("tasks.assignedUser", "users")
      .leftJoinAndSelect("tasks.createdUser", "admins")
      .where("tasks.assignedUser= :id", { id: user?.userId });
    //filter
    if (filterColumn?.startsWith("admins")) {
      const column = filterColumn?.split("_")[1];
      query.andWhere(`admins.${column} ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    } else if (filterColumn?.startsWith("tasks")) {
      if (filterColumn !== "" && filterValue !== "" && filterOperator !== "") {
        const column = filterColumn?.split("_")[1];
        query.andWhere(`tasks.${column} ILIKE :value`, {
          value: `%${filterValue}%`,
        });
      }
    }
    query.select([
      "tasks.taskId",
      "tasks.title",
      "tasks.description",
      "tasks.status",
      "users.email",
      "admins.email",
    ]);
    //sort
    if (sortColumnName?.startsWith("tasks")) {
      const column = sortColumnName.split("_")[1];
      if (sortColumnName && sortOrder == "asc") {
        query.orderBy(`tasks.${column}`, "ASC");
      } else if (sortColumnName && sortOrder === "desc") {
        query.orderBy(`tasks.${column}`, "DESC");
      }
    } else if (sortColumnName?.startsWith("admins")) {
      const column = sortColumnName.split("_")[1];
      if (sortColumnName && sortOrder == "asc") {
        query.orderBy(`admins.${column}`, "ASC");
      } else if (sortColumnName && sortOrder === "desc") {
        query.orderBy(`admins.${column}`, "DESC");
      }
    }
    const totalRecords = await query.getCount();
    //pagination
    let pages = Math.abs(page - 1) * records;
    query.offset(pages);
    query.limit(records);

    const result = await query.getRawMany();
    return res.status(200).json({ result: result || [], length: totalRecords || 0});
  } catch (error) {
    return res.status(400).json({ "Error at fetching length": error });
  }
};
export const updateTask: RequestHandler = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Id required to update a task" });
    }
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user details Required." });
    }
    const checkUserTask = await AppDataSource.getRepository(Tasks).find({
      where: {
        assignedUser: {
          userId: user.userId,
        },
        taskId: id,
      },
    });
    // checkUserTask have that user or not;
    if (checkUserTask.length <= 0) {
      return res
        .status(400)
        .json({ message: "Unauthorized Attemt to modify tasks" });
    } else {
      const result = await AppDataSource.createQueryBuilder()
        .update(Tasks)
        .set({
          status: `${status}`,
        })
        .where("taskId = :ID", { ID: id })
        .execute();
      return res.status(200).json({ message: "Update success" });
    }
  } catch (error) {
    return res.status(400).json({ "Error at fetching length": error });
  }
};
export const SpecificTask: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
  if (!id) {
      return res.status(400).json({ message: "Id required to fetch specific task" });
    }
  const user = req.user as any; 
    if (!user?.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user details Required." });
    }
  let result = await AppDataSource.getRepository(Tasks)
    .createQueryBuilder("task")
    .innerJoinAndSelect("task.createdUser", "createdUser")
    .innerJoinAndSelect("task.assignedUser", "assignedUser")
    .where("assignedUser.userId=:currentUserId", {
      currentUserId: user.userId,
    })
    .andWhere("task.taskId=:currentTaskId", {
      currentTaskId: parseInt(id as string),
    })
    .getMany();

  res.status(200).json(result || []);
  } catch (error) {
    return res.status(400).json({ "Error at fetching Specific task": error });
  }
};
export const fetchStatusTasks: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
  if(!user?.role){
    return res.status(400).json({ message: "UserId required to fetch statuses of tasks" });
  }
  const result = await AppDataSource.getRepository(Tasks)
    .createQueryBuilder("task")
    .select("status", "taskStatusCount")
    .addSelect("COUNT(task.taskId)", "count")
    .innerJoin("task.assignedUser", "user")
    .where("user.userId = :userId", { userId: user.userId })
    .groupBy("task.status")
    .getRawMany();

  return res.status(200).json(result || []);
  } catch (error) {
        return res.status(400).json({ "Error at fetch statuses of tasks": error });
  }
};
export const fetchAdminCreatedTasks: RequestHandler = async (req, res) => {
  const user = req.user;
  const result = await AppDataSource.getRepository(Tasks)
    .createQueryBuilder("task")
    .innerJoinAndSelect("task.createdUser", "createdUser")
    .select(["createdUser.email", "task.status"])
    .addSelect("COUNT(task.taskId)", "totalTasks")
    .where("task.assigned_user_id= :userId", { userId: user.userId })
    .groupBy("createdUser.email, task.status")
    .execute();
  return res.status(200).json(result);
};
