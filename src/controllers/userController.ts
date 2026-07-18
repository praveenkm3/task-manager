import { type RequestHandler } from "express";
import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";
import { Users } from "../models/User.ts";
import { 
  fetchStatusTasksQuery,
  fetchDatesQuery,
  fetchPriorityCountQuery,
  fetchAdminCreatedTasksQuery,
  SpecificTaskQuery,
}from "./utils.ts";


export const fetchTasks: RequestHandler = async (req, res) => {
  try {
    // console.log(req.body);
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
        // console.log(column);
        if (column === "dueDate") {
          // console.log("inside date filter");
          const start = filterValue[0]?.split("T")[0];
          const end = filterValue[1]?.split("T")[0];
          // console.log(start, end);
          query.andWhere(`tasks.dueDate >= :start AND tasks.dueDate <= :end`, {
            start: start,
            end: end,
          });
        } else if (column === "priority") {
          query.andWhere(`tasks.priority = :priority`, {
            priority:
              filterValue.charAt(0).toUpperCase() + filterValue.slice(1),
          });
        } else {
          query.andWhere(`tasks.${column} ILIKE :value`, {
            value: `%${filterValue}%`,
          });
        }
      }
    }
    query.select([
      "tasks.taskId",
      "tasks.title",
      "tasks.description",
      "tasks.status",
      "users.email",
      "admins.email",
      "tasks.dueDate",
      "tasks.priority",
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
    return res
      .status(200)
      .json({ result: result || [], length: totalRecords || 0 });
  } catch (error) {
    return res.status(400).json({ "Error at fetching at records": error });
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
      return res
        .status(400)
        .json({ message: "Id required to fetch specific task" });
    }
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(401)
        .json({ message: "Unauthorized, user details Required." });
    }
    let result = await SpecificTaskQuery(user,id);
    res.status(200).json(result || []);
  } catch (error) {
    return res.status(400).json({ "Error at fetching Specific task": error });
  }
};
//charts
export const fetchStatusTasks: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(400)
        .json({ message: "UserId required to fetch statuses of tasks" });
    }
    const result = await fetchStatusTasksQuery(user);
  
    return res.status(200).json(result || []);
  } catch (error) {
    return res.status(400).json({ "Error at fetch statuses of tasks": error });
  }
};
export const fetchAdminCreatedTasks: RequestHandler = async (req, res) => {
  try {
    const user = req.user as any;
    if (!user?.role) {
      return res
        .status(400)
        .json({ message: "UserId required to fetch statuses of tasks" });
    }
    const result = await fetchAdminCreatedTasksQuery(user);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: "Error at fetch Admin and tasks" });
  }
};
export const fetchPriorityCount: RequestHandler = async (req, res) => {
  try {
    const user = req?.user as any;
    const result =await fetchPriorityCountQuery(user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error });
  }
};
//calendar
export const fetchDates: RequestHandler = async (req, res) => {
  try {
    const user = req?.user as any;
    if (!user?.role) {
      return res
        .status(400)
        .json({ message: "UserId required to fetch statuses of tasks" });
    }
    const result=await fetchDatesQuery(user);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: "Error at fetching dates" });
    }
};
