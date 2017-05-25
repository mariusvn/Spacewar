
console.log("Multiplayer Mode");

ply.x = Math.floor((Math.random() * window.innerWidth) + 1);
ply.y = Math.floor((Math.random() * window.innerHeight) + 1);

let socket = io();
