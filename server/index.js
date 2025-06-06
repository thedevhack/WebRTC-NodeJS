const express = require('express');
const PORT = 3001;
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')

const io = new Server (server, {
    cors: {
        origin: 'http://localhost:5173'
    }
})

const users = {}
const rooms = {}


io.on('connection', (socket) => {
    console.log("User connected ")
    socket.on("join", (params) => {
        console.log(users)

        let roomId = params.roomId;

        if (rooms[roomId] && (rooms[roomId].users).length >= 2){
            socket.emit("room-full", { message: "Room is full" });
            return;
        }

        users[socket.id] = {roomId}

        if (!rooms[roomId]){
            rooms[roomId] = {
                roomId,
                users:[]
            }
        }
        rooms[roomId].users.push(socket.id)
    })

    socket.on("disconnect", params => {
        console.log(users, socket.id)
        let roomId = users[socket.id].roomId
        rooms[roomId].users = rooms[roomId].users.filter((user) => user !== socket.id)

        delete users[socket.id]

        console.log("user disconnected from room -> " + roomId)
    })

    socket.on("localDescription", (params) => {
        let roomId = users[socket.id].roomId
        let otherUsers = rooms[roomId].users

        otherUsers.forEach(user => {
            if (user !== socket.id){
                io.to(user).emit("localDescription", {
                    description:params.description
                })
            }
        });
    })
    socket.on("remoteDescription", (params) => {
        let roomId = users[socket.id].roomId
        let otherUsers = rooms[roomId].users

        otherUsers.forEach(user => {
            if (user !== socket.id){
                io.to(user).emit("remoteDescription", {
                    description:params.description
                })
            }
        });
    })
    socket.on("iceCandidate", (params) => {
        let roomId = users[socket.id].roomId
        let otherUsers = rooms[roomId].users

        otherUsers.forEach(user => {
            if (user !== socket.id){
                io.to(user).emit("iceCandidate", {
                    candidate:params.candidate
                })
            }
        });
    })
    socket.on("iceCandidateReply", (params) => {
        let roomId = users[socket.id].roomId
        let otherUsers = rooms[roomId].users

        otherUsers.forEach(user => {
            if (user !== socket.id){
                io.to(user).emit("iceCandidateReply", {
                    candidate:params.candidate
                })
            }
        });
    })
    
})


server.listen(PORT, () => {console.log("Backend server started !!!")})
