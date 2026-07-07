import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { Users } from "../models/User.ts";
import { Tasks } from "../models/Task.ts";

const DB_USER =process.env.DB_USER
const DB_HOST=process.env.DB_HOST       
const DB_NAME=process.env.DB_NAME      
const DB_PASSWORD=process.env.DB_PASSWORD   
const DB_PORT=process.env.DB_PORT as unknown as number      
// console.log(DB_USER,DB_HOST,DB_NAME,DB_PASSWORD,DB_PORT);
export const AppDataSource = new DataSource({
    type:DB_USER as 'postgres',
    host:DB_HOST as string ,
    port: DB_PORT as number,
    username: DB_USER as string,
    password: DB_PASSWORD as string,
    database: DB_NAME as string,
    synchronize: false,
    logging: true,
    entities: [Users, Tasks],
    migrations: ["src/migrations/**/*.ts"],
})
