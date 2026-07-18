import { AppDataSource } from "../config/db.ts";
import { generateAccessToken, generateRefreshToken } from "../controllers/tokens.ts";
import {
  fetchAdminCreatedTasksQuery,
  fetchDatesQuery,
  fetchPriorityCountQuery,
  fetchStatusTasksQuery,
  SpecificTaskQuery,
} from "../controllers/utils.ts";
import { Tasks } from "../models/Task.ts";
import { Users } from "../models/User.ts";

export const fetchTasksForUsers = async (user: any, body: any = {}) => {
  try {
    // console.log(user, body);
    const {
      filterColumn,
      filterValue,
      filterOperator,
      page,
      records,
      sortColumnName = undefined,
      sortOrder = undefined,
    } = body;
    const role = user?.role;
    const query =
      AppDataSource.getRepository(Tasks).createQueryBuilder("tasks");
    query.leftJoinAndSelect("tasks.assignedUser", "users");
    query.leftJoinAndSelect("tasks.createdUser", "admins");
    if (role === "admin") {
      query.where("tasks.createdUser= :id", { id: user?.userId });
    } else {
      // console.log("user 25 joins");
      query.where("tasks.assignedUser= :id", { id: user?.userId });
    }
    //filter
    if (filterColumn?.startsWith("users")) {
      const column = filterColumn?.split("_")[1];
      query.andWhere(`users.${column} ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    } else if (filterColumn?.startsWith("admins")) {
      // console.log("user 38 filter");
      const column = filterColumn?.split("_")[1];
      query.andWhere(`admins.${column} ILIKE :value`, {
        value: `%${filterValue}%`,
      });
    } else if (filterColumn?.startsWith("tasks")) {
      if (filterColumn !== "" && filterValue !== "" && filterOperator !== "") {
        const column = filterColumn?.split("_")[1];
        // console.log(column);
        if (column === "dueDate") {
          query.andWhere(`tasks.dueDate >= :start AND tasks.dueDate <= :end`, {
            start: filterValue[0],
            end: filterValue[1],
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
      "tasks.taskId tasks_taskId",
      "tasks.title tasks_title",
      "tasks.description tasks_description ",
      "tasks.status tasks_status",
      "users.email users_email",
      "admins.email admins_email",
      "tasks.dueDate tasks_dueDate",
      "tasks.priority tasks_priority",
    ]);

    //sorting
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
    } else if (sortColumnName?.startsWith("admins")) {
      // console.log("user 86 sort");
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
    return { result: result, length: totalRecords };
  } catch (error) {
    return { "Error at fetching Total tasks": error };
  }
};
export const updateTaskForUsers = async (user: any, args: any) => {
  try {
    const {
      taskId,
      title,
      description,
      assigned_user_id,
      duedate,
      priority,
      status="TO DO",
    } = args;
    const role = user?.role;
    if (role == "admin") {
      if (!title || !description || !assigned_user_id) {
        return "All task details required";
      }
    } else if (role === "user") {
      if (!status || !taskId) {
        return "Status and TaskId  required";
      }
    }
    let check = [];
    if (role === "admin") {
      check = await AppDataSource.getRepository(Tasks).find({
        where: {
          taskId: taskId,
          createdUser: {
            userId: user.userId,
          },
        },
      });
    } else if (role === "user") {
      check = await AppDataSource.getRepository(Tasks).find({
        where: {
          taskId: taskId,
          assignedUser: {
            userId: user.userId,
          },
        },
      });
    }

    if (check?.length <= 0) {
      return "No matched Tasks";
    }

    if (role === "admin") {
      const query = await AppDataSource.createQueryBuilder()
        .update(Tasks)
        .set({
          title: title,
          description: description,
          assignedUser: assigned_user_id,
          status: status,
          createdUser: user.userId,
          priority: priority,
          dueDate: duedate,
        })
        .where("taskId=:ID", { ID: taskId })
        .execute();
      return "Update Success";
    } else if (role === "user") {
      const query = await AppDataSource.createQueryBuilder()
        .update(Tasks)
        .set({
          status: `${status}`,
        })
        .where("taskId = :ID", { ID: taskId })
        .execute();
      return "Update Success";
    }
  } catch (error) {
    return "Error at updating task";
  }
};
export const SpecificTaskForUsers = async (user: any, taskId: any) => {
  try {
    if (typeof taskId !== "number") {
      return "Invalid TaskId";
    }
    if (!user.userId) {
      return "Unauthorized, admin details Required.";
    }
    const result = await SpecificTaskQuery(user, taskId);
    if (result.length === 0) {
      return "Task not found or you do not have permission to view it.";
    }
    return result;
  } catch (error) {
    return "Error Fetching At Specific Task";
  }
};
export const addTaskByAdmin = async (user: any, body: any) => {
  try {
    const { title, description, assigned_user_id, dueDate, priority } = body;
    if (!title || !description || !assigned_user_id) {
      return "All task details required";
    }
    if (!user?.userId) {
      return "Unauthorized, admin details Required.";
    }
    const result = await AppDataSource.createQueryBuilder()
      .insert()
      .into(Tasks)
      .values([
        {
          title: title,
          description: description,
          assignedUser: assigned_user_id,
          createdUser: user?.userId,
          dueDate: dueDate,
          priority: priority,
        },
      ])
      .execute();
    if (result.identifiers.length > 0) {
      return "Task Created Successfully";
    } else {
      return "Task Not Created Successfully";
    }
  } catch (error) {
    return "Error at creating task";
  }
};
export const deleteTaskByAdmin = async (user: any, taskId: any) => {
  try {
    if (!taskId) {
      return "Task ID is required";
    }
    const checking1 = await AppDataSource.getRepository(Tasks).find({
      where: {
        taskId: taskId,
        createdUser: {
          userId: user.userId,
        },
      },
    });
    if (checking1.length > 0) {
      const result = await AppDataSource.createQueryBuilder()
        .delete()
        .from(Tasks)
        .where("taskId=:id", { id: taskId })
        .execute();
      return "Task Deleted Successfully";
    } else {
      return "No matched Records";
    }
  } catch (error) {
    return "Error at Deleting task";
  }
};
export const fetchUsersByAdmin = async (user: any) => {
  try {
    if (!user?.userId) {
      ("Unauthorized, admin details Required.");
    }
    const users = await AppDataSource.getRepository(Users).find({
      where: {
        role: "user",
      },
    });
    return users;
  } catch (error) {
    return "Error at Fetching Users";
  }
};
export const fetchStatusTasks = async (user: any) => {
  try {
    if (!user?.userId) {
      ("Unauthorized, admin details Required.");
    }
    const result = await fetchStatusTasksQuery(user);
    return result;
  } catch (error) {
    return "Error at tetching task statuses";
  }
};
export const fetchUserAndAdminStatuseTasks = async (user: any) => {
  try {
    if (!user?.userId) {
      ("Unauthorized, admin details Required.");
    }
    const data = await fetchAdminCreatedTasksQuery(user);
    
    return data;
  } catch (error) {
    return "Error at fetching tasks&user Counts";
  }
};
export const fetchPriorityCountAdminAndUser = async (user:any) => {
  try { 
    const result = await fetchPriorityCountQuery(user);
    return result;
  } catch (error) {
    return "Error at Fetching Priority Counts";
  }
};
export const fetchDatesForUserAndAdmin = async (user:any) => {
  try { 
    if (!user?.userId) {
      return "AdminId required to fetch statuses of tasks";
    }
    const result=await fetchDatesQuery(user);
    return result; 
  } catch (error) {
    return "Error At Fetching Dates For Tasks"
  }
};
