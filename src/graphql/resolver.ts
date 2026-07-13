 import { AppDataSource } from "../config/db.ts";
import { Tasks } from "../models/Task.ts";
export const resolvers={
    Query:{
        hello:()=>{
            return "Hello GraphQl"
        },
        tasks:async()=>{
            const result=await AppDataSource.getRepository(Tasks).find();
            return result;
        }
    },
    Mutation:{
        tasks:async()=>{
            return "task created succussfull";
        }
    }

}