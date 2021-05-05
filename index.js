const express = require('express');
const app = express();
const moment = require('moment');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const {check, validationResult} = require('express-validator');
const cors = require('cors');
const ListUser = [];
app.use(cookieParser('nmh'));
app.use(session({ cookie: { maxAge: 60000 }}));
app.use(flash());
app.use(cors());

const loginValidation = [
    check('name').exists().withMessage('Vui lòng nhập Ten Nguoi')
    .notEmpty().withMessage('Tên Không được để Trống không được để trống')
]


const port = process.env.PORT || 5000;
const http = require('http');
// tao server voi http createServer
const server = http.createServer(app);
const io = require('socket.io')(server);
const bot = 'Night BOT';
// const io = socketio(server);
// tra ve thu muc view , style , public laf noi chua thong tin tra ve
app.use(express.static('views'));
app.use(express.static('style'));
app.use(express.static('public'));
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended:false}));
const arrayEmoji = ["😀", "😃", "😄 ","😁"," 😆"," 😅 ","😂 ","🤣 "," 😊"," 😇 ","🙂 ","🙃 ","😉 ","😌 ","😍 ","🥰 ","😘"," 😗",
    " 😙"," 😚 ","😋 ","😛 ","😝 ","😜 ","🤪 ","🤨 ","🧐 ","🤓 ","😎 "," 🤩"," 🥳"," 😏"," 😒"," 😞"," 😔"," 😟"," 😕"," 🙁"," ☹️"," 😣"," 😖"," 😫",
    " 😩"," 🥺","😢 ","😭"," 😤"," 😠 ","😡 ","🤬 ","🤯 ","😳 ","🥵 ","🥶 ","😱"," 😨"," 😰"," 😥"," 😓"," 🤗 ","🤔 ","🤭"," 🤫"," 🤥"," 😶"," 😐"," 😑"," 😬"," 🙄 ","😯 ","😦 ","😧 ","😮"," 😲",
    " 😴 ","🤤 ","😪 ","😵 ","🤐 ","🥴 ","🤢 ","🤮 ","🤧 ","😷 ","🤒 ","🤕 ","🤑 ","🤠 ","😈 ","👿"," 👹"," 👺"," 🤡"," 💩"," 👻", 
    " 💀"," ☠️ ","👽 ","👾 ","🤖 ","🎃 ","😺 ","😸 ","😹 ","😻 ","😼"," 😽"," 🙀"," 😿 ","😾"]


app.get('/',(req,res)=>{
    if(req.session.user){
        return res.redirect('chat'); 
    }else{
        const user = req.session.user;
        return res.render('index',{user});
    }
})
app.post('/',(req,res)=>{
    const {username , room} = req.body;
    req.flash('name',username);
    req.flash('room',room);
    // console.log(username, room);
    req.session.user = username;
    res.redirect('/chat')
})
app.get('/chat',(req,res)=>{
    if(!req.session.user){
        return res.redirect('/'); 
    }
    let name = req.flash('name')||'Người Tham Gia'+Math.floor(Math.random() * 10) + 1;
    let room = req.flash('room')||'';
    if(Object.values(name).length === 0){
        req.session.user = null;
        return res.redirect('/')
        // console.log('if nè');
    }else{
        // console.log(req.session.user)
        return res.render('chat',{name,room,arrayEmoji});
    }
    
})

app.get('/logout',(req,res)=>{
    req.session.user = null; // chỉ xóa biến user lưu thông tin user
    //req.session.destroy() // xóa hết toàn bộ những biến đã lưu
    res.redirect('/');
})

io.on('connection',(socket)=>{
    socket.on('join',({username,room} )=>{
        const user = userJoin(socket.id ,username,room );
        // console.log(user);
        socket.join(user.room);
        //console.log('Co nguoi truy cap');
        // gửi message sang client với nội dung là chào mừng
        socket.emit('message',formatMessage(bot,`Chào mừng ${user.username} đến với nhóm chat`));

        // gửi message sang client trừ người gửi ra
        socket.broadcast.to(user.room).emit('message',formatMessage(bot,`${user.username} đã tham gia nhóm chat`));

        // gửi danh sách phòng và danh sách người dùng
        var myObject = {
            user: getRoom(room),
            room:room
        }
        io.to(user.room).emit('room',myObject);

    })
    socket.on('chatMess',(msg)=>{
        const thisUser = getCurrentUser(socket.id);
        io.to(thisUser.room).emit('message',formatMessage(thisUser.username,msg))
    })

    // tắt kết nối vì
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);
        // console.log(user);
        if(user){
            io.to(user.room).emit('message',formatMessage(bot,`${user.username} đã rời khỏi nhóm chat`));

            var myObject = {
                user: getRoom(user.room),
                room:user.room
            }
            io.to(user.room).emit('room',myObject);
        }
    })
})



function formatMessage(username , mess){
    return {
        username,
        mess,
        time: moment().format('h:mm a')
    };
}
function userJoin(id, username, room) {
    const user = { id, username, room };
    ListUser.push(user);
    return user;
  }
  
  // Get current user
  function getCurrentUser(id) {
    return  ListUser.find(user => user.id === id);
  }
  
  // User leaves chat
  function userLeave(id) {
    const index =  ListUser.findIndex(user => user.id === id);
      return  ListUser.splice(index, 1)[0];
  }
  
  // Get room users
  function getRoom(room) {
    return  ListUser.filter(user => user.room === room);
  }


server.listen(port,()=>{
    console.log('Sever is running at http://localhost:'+port);
})