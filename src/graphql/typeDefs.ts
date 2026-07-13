export const typeDefs=`#graphql 
type Task{
id:ID!
title:String!
description:String
}
type Query{
    hello:String
    tasks:[Task!]!
}
type Mutation{
    tasks:String
}
`;