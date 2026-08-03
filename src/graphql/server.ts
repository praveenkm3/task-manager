import { ApolloServer } from "@apollo/server";
import { typeDefs } from "./typeDefs.ts";
import { resolvers } from "./resolver.ts";

export const server=new ApolloServer({
    typeDefs,resolvers
})