
console.log("Multiplayer Mode");

ply.x = Math.floor((Math.random() * window.innerWidth) + 1);
ply.y = Math.floor((Math.random() * window.innerHeight) + 1);

let socket = io();

let users = [];

function getUserById(id){
    for(let i = 0; i < users.length; i++){
        if(users[i].id === id){
            return users[i];
        }
    }
    return undefined;
}

class otherPlayer extends vessel{
    constructor(x,y,id){
        super(x,y,0xFFFF00, 1);
        this.id = id;
        users.push(this);
    }
    fire(){
        new multiBullet(this.x, this.y, this.rotation, this);
    }
}

class multiBullet extends bullet{

}

socket.on('player:add', function(id){
    new otherPlayer(100, 100, id);
});

socket.on('player:rem', function (id) {
    let user = getUserById(id);
    if(user !== undefined) {
        user.died();
    }
});

socket.on('player:addOther', function (list) {
    for(let i = 0; i < list.length; i++){
        new otherPlayer(list[i].x, list[i].y, list[i].id);
    }
});

ticker.add(updateNetwork, this);

function updateNetwork(deltaTime){
    socket.emit('player:movement', ply.x, ply.y, ply.rotation);
}

socket.on('player:movementBack', function (x, y, id, rot) {
    let usr = getUserById(id);
    usr.x = x;
    usr.y = y;
    usr.rotate(rot);
});

document.getElementsByTagName("CANVAS")[0].onclick = function(){
    ply.fire();
    socket.emit('player:fire');
};

socket.on('player:fire', function (id) {
    let usr = getUserById(id);
    usr.fire();
});