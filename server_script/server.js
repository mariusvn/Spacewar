let express = require("express");
let app = express();
let http = require('http').Server(app);

let id = 0;

app.use('/', express.static('../static'));
app.use('/client_script', express.static('../client_script'));


let serv = app.listen(3000,  function () {
    console.log('listening on 3000');
});

let io = require('socket.io').listen(serv);

let userList = [];

class client{
    constructor(id){
        this.id = id;
        this.x = 100;
        this.y = 100;
        this.rot = 0;
        userList.push(this);
    }
    delete(){
        let index = userList.indexOf(this);
        userList.splice(index, 1);
    }
}

io.on('connection', function (socket) {

    //init
    socket.emit('player:addOther', userList);
    let usr = new client(id);
    id++;
    console.log(userList);
    socket.join('game');
    socket.to('game').emit('player:add', usr.id);
    console.log("a player joined the game");

    //game
    socket.on('player:movement', function(x, y, rot){
        socket.to('game').emit('player:movementBack', x, y, usr.id, rot);
        usr.x = x;
        usr.y = y;
        usr.rot = rot;
    });
    socket.on('disconnect', function(){
        socket.to('game').emit('player:rem', usr.id);
        usr.delete();
        console.log('a user disconnected');
    });
    socket.on('player:fire', function(){
        socket.to('game').emit('player:fire', usr.id);
    });
});