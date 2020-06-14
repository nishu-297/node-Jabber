//const users = require("../../src/utils/users");

let socket = io();

// Elements 

let $messageForm = document.querySelector('#message-form');
let $messageFormButton = $messageForm.querySelector('button');
let $messageFormInput = $messageForm.querySelector('input');
let $sendLocationButton = document.querySelector('#send-location');
let $messages = document.querySelector('#messages')

//Template

let $messageTemplate = document.querySelector('#message-template').innerHTML;
let $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML;
let $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

//Options
let { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

let autoscroll = () => {
    //New message Element
    const $newMessage = $messages.lastElementChild;

    //Height of a new Meassage
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of a Message container
    const containerHeight =$messages.scrollHeight;

    //How far I have Scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset)
     {
        $messages.scrollTop = $messages.scrollHeight;
    }

}

socket.on('newConnection', (message) => {
    console.log(message);

})

// let send = document.querySelector('input');

$messageForm.addEventListener('submit', (e) => {

    $messageFormButton.setAttribute('disabled', 'disabled')
    e.preventDefault();
    let send = e.target.elements.message
    let value = send.value;

    socket.emit('message', value, (error) => {
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = ''
        $messageFormInput.focus();
        if (error) {
            return console.log(error);
        }
        console.log('Message Delivered')
    });

})

socket.on('newMessage', (message) => {

    console.log(message);
    const html = Mustache.render($messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('locationMessage', (MapsURl) => {
    console.log(MapsURl)
    let html = Mustache.render($locationMessageTemplate, {
        username: MapsURl.username,
        url: MapsURl.url,
        createdAt: moment(MapsURl.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})


socket.on('roomData', ({ room, users }) => {
    console.log(room);
    console.log(users)
    let html = Mustache.render($sidebarTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html;
})

$sendLocationButton.addEventListener('click', () => {
    $sendLocationButton.setAttribute('disabled', 'disabled')

    if (!navigator.geolocation) {
        return alert('Geolocation Not Supported')
    }

    navigator.geolocation.getCurrentPosition((position) => {
        coordinates = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        socket.emit('sendLocation', coordinates, () => {
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared');
        })

    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
})

