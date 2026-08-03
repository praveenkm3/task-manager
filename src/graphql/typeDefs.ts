export const typeDefs = `#graphql 
scalar Date
enum Priority{
Medium
High
Low
}

type Task{
    tasks_taskId :Int!
    tasks_title:String!
    tasks_description:String!
    tasks_status :String!
    tasks_dueDate:Date! 
    users_email:String!
    admins_email:String
    tasks_priority:Priority!
    admins_userid:Int
    users_userid:Int
}
type TaskResponse{
    result:[Task!]!
    length:Int!
}

type User{
    userId:Int
    userName:String
    email:String
    role:String
    isActive:String
}
type TaskStatuses{
    taskStatusCount:String!,
    count:Int
}
type UserAndAdminStatuses{
        email:String
        status:String
        totalTasks:Int
}
type PriorityCountTasks{
    label1:String
    label2:String
    value:String
}
type FetchDateTasks{
    tasks_taskId:Int
    id: Int,
    taskname: String,
    duedate: Date,
    status: String
}
type Query{ 
    tasks:TaskResponse!
    getOneTask(taskId:Int!) :[Task!]!
    fetchUsers:[User!]!
    fetchTaskStatuses:[TaskStatuses]
    fetchUserAndAdminStatuses:[UserAndAdminStatuses]
    fetchPriorityCount:[PriorityCountTasks]
    fetchDates:[FetchDateTasks]
}
input UpdateTaskInput {
  taskId:Int
  title: String
  description: String
  priority: Priority
  status:String
  duedate: Date
  assigned_user_id : Int
}
input AddTaskInput{
    assigned_user_id:Int
    description:String
    dueDate:Date
    priority :Priority
    title:String
}
type Mutation {
    updateTask(input: UpdateTaskInput!): String!
    addTask(input:AddTaskInput!):String!
    deleteTask(taskId:Int):String!
}
`;
