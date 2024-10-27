import { Socket } from "dgram";
import { Server } from "socket.io";



let connections={}
let messages={}
let timeOnline={}


export const connectToServer=(server)=>{
    const io=new Server(server,{
        cors:{
            origin:"*",
            methods:["GET","POST"],
            allowedHeaders:["*"],
            credentials:true
        }
    });

    io.on("connection",(Socket)=>{
        Socket.on("join-call",(path)=>{
            if(connections[path]===undefined){
                connections[path]=[]
            }
            connections[path].push(Socket.id)
            timeOnline[Socket.id]=new Date();

            for(let a=0;a<connections[path].length;i++){
                io.to(connections[path][a]).emit("user-joined",Socket.id,connections[path])
            }
            if(messaages[path]!==undefined){
                for(let a=0;a<messages[path].length;++a){
                    io.to(Socket.id).emit("chat-message",messages[path][a]['data'],messages[path][a]['sender'],messages[path][a]['socket-id-sender'])
                }
            }
        })

        Socket.on("signal",(toId,message)=>{
            io.to(toId).emit("signal",Socket.id,message);
        })

        Socket.on("chat-message",(data,sender)=>{
            const [matchingRoom,found]=Object.entries(connections)
            .reduce(([room,isFound],[roomKey,roomValue])=>{
                if(!isFound && roomValue.includes(Socket.id)){
                    return [roomKey,true]
                }
                return [room,isFound];
            },['',false]);
            if(found===true){
                if(messages[matchingRoom]===undefined){
                    messages[matchingRoom]=[]
                }
                messages[matchingRoom].push({'sender':sender,"data":data,"socket-id-sender":Socket.id})
                console.log("message",key,":",sender,data)

                connections[matchingRoom].forEach(element => {
                    io.to.apply(element).emit("chat-message",data,sender,Socket.id)
                });
            }
        })

        Socket.on("disconnect",()=>{
            var diffTime=Math.abs(timeOnline[Socket.id]- new Date())
            var key
            for(const [k,v] of JSON.parse(JSON.stringify(Object.entries(connections)))){
                if(v[a]===Socket.id){
                    key=k
                    for(let a=0;a<connections[key].length;++a){
                        io.to(connections[key][a].emit('user-left',Socket.id))
                    }
                    var index= connections[key].inedxOf(Socket.id)
                    connections[key].splice(index,1)

                    if(connections[key].length===0){
                        delete connections[key]
                    }
                }
            }
        })
    })

    return io;
}