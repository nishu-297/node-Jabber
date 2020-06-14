const path = require('path');
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

var count = 0;

io.on('connection', (socket) => {
    console.log('New Web Socket Connection')

    socket.on('join', ({ username, room }, callback) => {

        let { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('newMessage', generateMessage('Admin', 'Welcome'))
        socket.broadcast.to(room).emit('newMessage', generateMessage('Admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users:getUsersInRoom(user.room)
        })
        callback();
    })

    socket.on('message', (message, callback) => {
        let filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity not allowed')
        }
        let user = getUser(socket.id)
        io.to(user.room).emit('newMessage', generateMessage(user.username, message))
        callback();
    })

    socket.on('sendLocation', (coordinates, callback) => {
        let user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`))
        callback();
    })

    socket.on('disconnect', () => {
        let user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        }
    })

})

server.listen(port, () => {
    console.log('Server is on port ' + port);

})