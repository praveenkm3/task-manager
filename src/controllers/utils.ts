import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";

export const fetchDatesQuery = async (user) => {
  try {
    // console.log(user);
    const result =
      await AppDataSource.getRepository(Tasks).createQueryBuilder("tasks");
    if (user?.role === "user") {
      result.where("tasks.assigned_user_id= :userId", { userId: user.userId });
    } else if (user?.role == "admin") {
      result.where("tasks.created_user_id= :userId", { userId: user.userId });
    }
    result.select([
      "tasks.taskId as id",
      "tasks.title as taskName",
      "tasks.taskId",
      "tasks.dueDate as dueDate",
      "tasks.status as status",
    ]);
    const date = await result.execute();
    return date;
  } catch (error) {
    return "Error at fetching dates";
  }
};
export const fetchPriorityCountQuery = async (user) => {
  try {
    const result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("tasks")
      .select([
        "tasks.priority label1",
        "tasks.status label2",
        "count(tasks.taskId) value",
      ]);
    if (user?.role == "user") {
      result.where("tasks.assigned_user_id= :userId", { userId: user.userId });
    } else if (user?.role == "admin") {
      result.where("tasks.created_user_id= :userId", { userId: user.userId });
    }
    result.addGroupBy("tasks.priority");
    result.addGroupBy("tasks.status");
    const data = await result.execute();
    return data;
  } catch (error) {
    return "Error at fetchPriorityCount";
  }
};
export const fetchAdminCreatedTasksQuery = async (user) => {
  try {
    const result =
      await AppDataSource.getRepository(Tasks).createQueryBuilder("task");
    if (user?.role === "user") {
      result.innerJoinAndSelect("task.createdUser", "createdUser");
      result.select(["createdUser.email email", "task.status status"]);
      result.addSelect("COUNT(task.taskId)", "totalTasks");
      result.where("task.assigned_user_id= :userId", { userId: user.userId });
      result.groupBy("createdUser.email, task.status");
    } else if (user?.role === "admin") {
      result.innerJoinAndSelect("task.assignedUser", "assignedUser");
      result.select(["assignedUser.email email", "task.status status"]);
      result.addSelect("COUNT(task.taskId)", "totalTasks");
      result.where("task.created_user_id= :userId", { userId: user.userId });
      result.groupBy("assignedUser.email, task.status");
    }
    const data = await result.execute();
    return data;
  } catch (error) {
    return `Error at fetching tasks`;
  }
};
export const fetchStatusTasksQuery = async (user) => {
  try {
    const result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("task")
      .select("status", "taskStatusCount")
      .addSelect("COUNT(task.taskId)", "count");
    if (user?.role == "admin") {
      result.innerJoin("task.createdUser", "user");
      result.where("user.userId = :userId", { userId: user.userId });
    } else if (user?.role === "user") {
      result.innerJoin("task.assignedUser", "user");
      result.where("user.userId = :userId", { userId: user.userId });
    }
    result.groupBy("task.status");
    const data = await result.getRawMany();
    return data;
  } catch (error) {
    return "Error at Fetching task statuses";
  }
};
export const SpecificTaskQuery = async (user:any, id:any) => {
  try {
    let result = await AppDataSource.getRepository(Tasks)
      .createQueryBuilder("tasks")
      .select(["tasks.taskId tasks_taskId",
      "tasks.title tasks_title",
      "tasks.description tasks_description ",
      "tasks.status tasks_status",
      "createdUser.email admins_email",
      "tasks.created_user_id admins_userId",
      "assignedUser.email users_email",
      "tasks.assigned_user_id users_userId",
      "tasks.dueDate tasks_dueDate",
      "tasks.priority tasks_priority",
    ])


      .innerJoin("tasks.createdUser", "createdUser")
      .innerJoin("tasks.assignedUser", "assignedUser");
    if (user?.role == "user") {
      result.where("assignedUser.userId=:currentUserId", {
        currentUserId: user.userId,
      });
    } else if (user?.role === "admin") {
      result.where("createdUser.userId = :currentUserId", {
        currentUserId: user.userId,
      });
    }

    result.andWhere("tasks.taskId=:currentTaskId", {
      currentTaskId: parseInt(id as string),
    });
    const data = await result.execute(); 

    return data;
  } catch (error) {
    return "Error at fetching Specific task";
  }
};
