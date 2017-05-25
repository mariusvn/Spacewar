
//TODO: spawner not active when tab not focused
var spawnFrq = 1500;
function spawner() {
    spawnFrq = spawnFrq - 5;
    if(spawnFrq < 500){
        spawnFrq = 500;
    }
    setTimeout(function () {
        var ennemy = new enemy(Math.floor((Math.random() * window.innerWidth) + 1), Math.floor((Math.random() * window.innerHeight) + 1), 0xFFFF00, 1);
        spawner();
    }, spawnFrq);
}
spawner();