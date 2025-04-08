const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();

const server = http.createServer(app);

// initiate socket.io and attach this to the http server
const io = socketIo(server);

app.use(express.static('public'));

const users = new Set();

io.on('connection', (socket) => {
    console.log('connection successful');

    // handle users when they will join the chat
    socket.on('join', (userName) => {
        users.add(userName);
        socket.userName = userName;

        // broadcast all the clients/users that new user has joined
        io.emit('userJoined', userName);

        // Send the updated userlist to all clients
        io.emit('userList', Array.from(users));
    })

    // handle incoming chat message
    socket.on('chatMessage', (message) => {
        io.emit('chatMessage', message);
    })

    // handle user disconnection
    socket.on('disconnect', () => {
        console.log('An user is disconnected', socket.userName);

        users.forEach((user) => {
            if (user == socket.userName) {
                users.delete(user);

                io.emit('userLeft', user);

                io.emit('userList', Array.from(users));
            }
        })
    })
})

server.listen(3200, () => {
    console.log(`Server is listening on port http://localhost:3200`);
})