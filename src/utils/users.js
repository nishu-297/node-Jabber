const users = []

//addUsders, removeUser, getUser, getUsersInRoom

let addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();
    //Validate
    if (!username || !room) {
        return {
            error: 'Please provide username & Room'
        }
    }
    //Check for existing user

    let existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })
    //Validate Username

    if (existingUser) {
        return {
            error: 'username already Exist'
        }
    }
    //Store the User

    let user = { id, username, room }
    users.push(user);
    return { user }
}

let removeUser = (id) => {
    let index = users.findIndex((user) => {
        return user.id === id
    })
    console.log(index)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
let getUser = (id) => {

    let foundUser = users.find((user) => {
        return user.id === id;
    })
    return foundUser;
}

//let usersInRoom=[];
let getUsersInRoom = (roomname) => {
    roomname = roomname.trim().toLowerCase();
    let usersList = users.filter((user) => {
        return user.room === roomname
    })
    return usersList
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}