import express from "express";
import {createServer} from "node:http";
import { Server } from "socket.io";
import mongoose from  "mongoose";
import cors from "cors";
import userRoutes from "./routes/users.routes.js"
import {connectToServer} from "./controlers/socketManager.js";

const app=express();
const server=createServer(app);
const io=connectToServer(server);

app.set("port",(process.env.PORT || 8000))
app.use(cors())
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use("/api/v1/users",userRoutes)


app.get("/home",(req,res)=>{
    return res.json({"hello":"world"})
});

//connecting to the mongodb atlas database 
const start=async()=>{
    const connectionDb =await mongoose.connect("mongodb+srv://chiraghm2004:wdLgSbgAkMc4myk@cluster0.jxpsp.mongodb.net/")
    console.log(`mongo connected DB host:${connectionDb.connection.host}`)
    server.listen(app.get("port"),()=>{
        console.log("listeningn on port 8000")
    })
}

start();