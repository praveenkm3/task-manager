import {
  fetchTasksForUsers,
  updateTaskForUsers,
  SpecificTaskForUsers,
  addTaskByAdmin,
  deleteTaskByAdmin,
  fetchUsersByAdmin,
  fetchStatusTasks,
  fetchUserAndAdminStatuseTasks,
  fetchPriorityCountAdminAndUser,
  fetchDatesForUserAndAdmin
} from "./services.ts";
import { GraphQLDateTime } from "graphql-scalars";

export const resolvers = {
  Date: GraphQLDateTime,
  Query: {
    tasks: async (parent: any, args: any, context: any, info: any) => {
      try {
        const user = context?.req?.user;
        const {
          body: { body },
        } = context?.req;
        const { result, length } = await fetchTasksForUsers(user, body);
        // console.log(Array.isArray(result))
        return { result, length };
      } catch (error) {
        return "Error at Fetching Tasks";
      }
    },
    getOneTask: async (parent: any, args: any, context: any, info: any) => {
      try {
        const user = context?.req?.user;
        console.log(args);
        const { taskId } = args;
        const data = await SpecificTaskForUsers(user, taskId);
        // console.log(Array.isArray(result))
        return data;
      } catch (error) {
        return "Error at Fetching Tasks";
      }
    },
    fetchUsers:async(parent: any, args: any, context: any, info: any)=>{
        try {
            const user=context?.req?.user;
            if (user?.role != "admin") {
                return "Not Allowed to To See All users";
            }
            const result=await fetchUsersByAdmin(user);
            return result;
        } catch (error) {
            return "Error at Fetching Users";
        }
    },
    fetchTaskStatuses:async (parent: any, args: any, context: any, info: any)=>{
        try {
        const user = context?.req?.user;
        const result=await fetchStatusTasks(user);
        return result; 
      } catch (error) {
        return "Error in Task Creation";
      }
    },
    fetchUserAndAdminStatuses:async(parent: any, args: any, context: any, info: any)=>{
        try {
        const user = context?.req?.user;
        const result=await fetchUserAndAdminStatuseTasks(user);
        return result; 
        } catch (error) {
            return "Error in Task Creation";
        }
    },
    fetchPriorityCount:async(parent: any, args: any, context: any, info: any)=>{
        try {
          const user = context?.req?.user;
          const result=await fetchPriorityCountAdminAndUser(user);
          return result; 
        } catch (error) {
          return "Error in Fetch Priority Count";
        }
    },
    fetchDates:async(parent: any, args: any, context: any, info: any)=>{
        try {
          const user = context?.req?.user;
          const result=await fetchDatesForUserAndAdmin(user);
          return result; 
        } catch (error) {
          return "Error in Fetch Priority Count";
        }
    }
  },
  Task: {
    tasks_dueDate: (parent: any) => parent.tasks_duedate,
    tasks_taskId: (parent: any) => parent.tasks_taskid,
  },
  Mutation: {
    updateTask: async (parent: any, args: any, context: any, info: any) => {
      try {
        const user = context?.req?.user;
        const body = args?.input;
        const result = await updateTaskForUsers(user, body);
        return result;
      } catch (error) {
        return "Error in Task Updation";
      }
    },
    addTask: async (parent: any, args: any, context: any, info: any) => {
      try {
        const user = context?.req?.user;
        if (user?.role != "admin") {
          return "Not Allowed to Create Task";
        }
        const body = args?.input;
        const result = await addTaskByAdmin(user, body);
        return result;
      } catch (error) {
        return "Error in Task Creation";
      }
    },
    deleteTask: async (parent: any, args: any, context: any, info: any) => {
      try {
        const user = context?.req?.user;
        if (user?.role != "admin") {
          return "Not Allowed to Delete Task";
        }
        const { taskId } = args;
        const result = await deleteTaskByAdmin(user, taskId);
        return result;
      } catch (error) {
        return "Error in Task Creation";
      }
    }
  },
};
