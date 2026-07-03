import type { RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";
import { Users } from "../models/User.ts";
export const addTask: RequestHandler = async (req, res) => {
  try {
    const { title, description, assigned_user_id } = req.body;
    if (!title || !description || !assigned_user_id) {
      return res.status(200).json({ message: "All task details required" });
    }
    const admin = req.user as any;
    if (!admin?.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
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
  } catch (error) {
    return res.status(400).json({ "Error at creating task": error });
  }
};
export const fetchUsers: RequestHandler = async (req, res) => {
  try {
    const admin = req.user as any;
    if (!admin?.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
    const users = await AppDataSource.getRepository(Users).find({
      where: {
        role: "user",
      },
    });
    return res.status(200).json(users || []);
  } catch (error) {
    return res.status(400).json({ "Error at fetching Users": error });
  }
};
export const updateTask: RequestHandler = async (req, res) => {
  try {
    const { taskId, title, description, assigned_user_id } = req.body;
    if (!title || !description || !assigned_user_id) {
      return res.status(200).json({ message: "All task details required" });
    }
    const admin = req.user as any;
    if (!admin?.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
    const checking1 = await AppDataSource.getRepository(Tasks).find({
      where: {
        taskId: taskId,
        createdUser: {
          userId: admin.userId,
        },
      },
    });
    // return res.json(checking1)
    if (checking1.length <= 0) {
      return res.status(200).json({ message: "No matched Tasks" });
    }

    const result = await AppDataSource.createQueryBuilder()
      .update(Tasks)
      .set({
        title: title,
        description: description,
        assignedUser: assigned_user_id,
        status: "pending",
        createdUser: admin.userId,
      })
      .where("taskId=:ID", { ID: taskId })
      .execute();
    return res
      .status(201)
      .json({ message: `${title} updated by ${admin?.email}` });
  } catch (error) {
    return res.status(400).json({ "Error at updating task": error });
  }
};
export const fetchTasks: RequestHandler = async (req, res) => {
  try {
    console.log(req.body);
    const {
      filterColumn,
      filterValue,
      filterOperator,
      page,
      records,
      sortColumnName = undefined,
      sortOrder = undefined,
    } = req.body;
    const admin = req.user as unknown as {
      userId: number;
    };

    const query = AppDataSource.getRepository(Tasks)
      .createQueryBuilder("tasks")
      .leftJoinAndSelect("tasks.assignedUser", "users")
      .leftJoinAndSelect("tasks.createdUser", "admins")
      .where("tasks.createdUser= :id", { id: admin?.userId });
    //filter
    if (filterColumn?.startsWith("users")) {
      const column = filterColumn?.split("_")[1];
      query.andWhere(`users.${column} ILIKE :value`, {
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
    if (sortColumnName?.startsWith("tasks")) {
      const column = sortColumnName.split("_")[1];
      if (sortColumnName && sortOrder == "asc") {
        query.orderBy(`tasks.${column}`, "ASC");
      } else if (sortColumnName && sortOrder === "desc") {
        query.orderBy(`tasks.${column}`, "DESC");
      }
    } else if (sortColumnName?.startsWith("users")) {
      const column = sortColumnName.split("_")[1];
      if (sortColumnName && sortOrder == "asc") {
        query.orderBy(`users.${column}`, "ASC");
      } else if (sortColumnName && sortOrder === "desc") {
        query.orderBy(`users.${column}`, "DESC");
      }
    }
    const totalRecords = await query.getCount();
    //pagination
    let pages = Math.abs(page - 1) * records;
    query.offset(pages);
    query.limit(records);

    const result = await query.getRawMany();
    return res.status(200).json({ result: result, length: totalRecords });
  } catch (error) {
    return res.status(400).json({ "Error at fetching Total tasks": error });
  }
};
export const SpecificTask: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const taskId = parseInt(id as string);
    if (typeof taskId !== "number") {
      return res.status(400).json({ message: "Invalid Task Id" });
    }
    const admin = req.user as any;

    if (!admin.userId) {
      return res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }

    const result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("task")
      .innerJoinAndSelect("task.createdUser", "createdUser")
      .innerJoinAndSelect("task.assignedUser", "assignedUser")
      .where("createdUser.userId = :currentUserId", {
        currentUserId: admin.userId,
      })
      .andWhere("task.taskId = :currentTaskId", {
        currentTaskId: taskId,
      })
      .getMany();
    if (result.length === 0) {
      return res.status(404).json({
        message: "Task not found or you do not have permission to view it.",
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ "Error fetching specific task": error });
  }
};
export const deleteTask: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(200).json({ message: "All task details required" });
    }
    const { taskId } = req.body;
    if (!taskId) {
      return res.status(200).json({ message: "Task ID is required" });
    }
    const admin = req.user as any;
    if (!admin?.role) {
      res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
    const checking1 = await AppDataSource.getRepository(Tasks).find({
      where: {
        taskId: taskId,
        createdUser: {
          userId: admin.userId,
        },
      },
    });
    // return res.status(200).json(checking1)
    if (checking1.length > 0) {
      const result = await AppDataSource.createQueryBuilder()
        .delete()
        .from(Tasks)
        .where("taskId=:id", { id: taskId })
        .execute();
      return res.status(200).json(result);
    } else {
      return res.status(200).json({ message: "No matched Records" });
    }
  } catch (error) {
    return res.status(400).json({ "Error at Deleting task": error });
  }
};
//charts
export const fetchStatusTasksAdmin: RequestHandler = async (req, res) => {
  try {
    const admin = req.user as any;
    if (!admin?.role) {
      res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
    const result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("task")
      .select("status", "taskStatusCount")
      .addSelect("COUNT(task.taskId)", "count")
      .innerJoin("task.createdUser", "user")
      .where("user.userId = :userId", { userId: admin.userId })
      .groupBy("task.status")
      .getRawMany();
    return res.status(200).json(result || []);
  } catch (error) {
    return res.status(400).json({ "Error at tetching task statuses": error });
  }
};
export const fetchAdminAssignedTasks: RequestHandler = async (req, res) => {
  try {
    const admin = req.user as any;
    if (!admin?.role) {
      res
        .status(401)
        .json({ message: "Unauthorized, admin details Required." });
    }
    const result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("task")
      .innerJoinAndSelect("task.assignedUser", "assignedUser")
      .select(["assignedUser.email", "task.status"])
      .addSelect("COUNT(task.taskId)", "totalTasks")
      .where("task.created_user_id= :userId", { userId: admin.userId })
      .groupBy("assignedUser.email, task.status")
      .execute();
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(400)
      .json({ "Error at fetching tasks&user Counts": error });
  }
};
