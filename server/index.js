import express from "express";
import dotenv from 'dotenv'
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { schema } from "./schema/schema.js";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { expressMiddleware } from "@apollo/server/express4";
import { connectDB } from "./config/db.js";

dotenv.config();
const PORT = process.env.PORT || 7000;

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

const server = new ApolloServer({
    schema: schema
})

const startServer = async () => {
    await server.start();

    app.use(
        '/graphql',
        expressMiddleware(server)
    );
    
    app.listen(PORT, () => {
        console.log(`Server is Listening On ${PORT}`);
    })
}

startServer();
