let express = require("express");
let app = express();
let http = require('http').Server(app);

app.use('/', express.static('../static'));
app.use('/client_script', express.static('../client_script'));


let serv = app.listen(3000, function () {
    console.log('listening on 3000');
});

let io = require('socket.io').listen(serv);

io.on('connection', function (socket) {
    console.log("a player joined the game");
    socket.on('player:movement', function(msg){
        
    })
});