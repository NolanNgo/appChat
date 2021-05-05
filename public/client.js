
var socket = io();
const chatArea = document.getElementById('chatForm');
const chatWindow = document.querySelector('.chatMessages');
const Room = document.getElementById('room-name');
const ListUser = document.getElementById('users');
const emoji = document.querySelectorAll('.emoji');
const dashboard = document.getElementById('dashboard');
let msg = document.getElementById('msg')
// console.log(username);
// console.log(room);
// 

socket.emit('join',{username,room});

socket.on('message',(message)=>{
    // console.log(message);
    printMessage(message,'message');
    // chỉnh cho màn hìn chat khi chat có thể kéo lên kéo xuống
    chatWindow.scrollTop = chatWindow.scrollHeight;
})
socket.on('room',(object)=>{
    printRoom(object.room);
    printListUser(object.user);
    // console.log(room);
    
})
emoji.forEach(emo => {
    emo.addEventListener('click',(e)=>{
        msg.value = msg.value + e.target.innerText;
        
    })
})
chatArea.addEventListener('submit',(e)=>{
    e.preventDefault();
    // var msg = e.target.elements.msg.value;
    let result = msg.value
    socket.emit('chatMess',result);

    //
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

function printMessage(objectM,classMess){
    var newMess = document.createElement('div');
    newMess.classList.add(classMess);
    newMess.innerHTML = `
    <p class="meta">${objectM.username}<br>${objectM.time}</span></p>
    <p class="text">
    ${objectM.mess}
    </p>`
    document.querySelector('.chatMessages').appendChild(newMess);
}
function printRoom(room){
    Room.innerHTML =room;
}
function printListUser(users){
    ListUser.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      ListUser.appendChild(li);
    });
}