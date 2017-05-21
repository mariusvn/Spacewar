renderer = PIXI.autoDetectRenderer(256, 256, {antialias: true, transparent: false, resolution: 2});

document.body.appendChild(renderer.view);
renderer.view.style.position = "absolute";
renderer.view.style.display = "block";
renderer.autoResize = true;
renderer.resize(window.innerWidth, window.innerHeight);

var stage = new PIXI.Container();

var playerPos = {
    x: 500,
    y: 500
};

var mousePos = {
    x: 400,
    y: 300
};

var control = {
    top: false,
    down: false,
    left: false,
    right: false
};

renderer.render(stage);


vesselList = [];
bulletList = [];

class bullet{
    constructor(x,y,rotation){
        this.container = new PIXI.Container();
        this.bullet = new PIXI.Graphics();
        this.container.addChild(this.bullet);
        this.container.x = x;
        this.container.y = y;
        this.container.rotation = rotation;
        this.bullet.lineStyle(1, 0xFFFFFF, 1);
        this.bullet.moveTo(0,0);
        this.bullet.lineTo(0,2);
        this.inc = 0;
        bulletList.push(this);
        stage.addChild(this.container);
    }

    update(){
        this.inc++;
        this.bullet.clear();
        if(this.inc == 150){
            var index = bulletList.indexOf(this);
            bulletList.splice(index, 1);
        }else {
            this.bullet.lineStyle(1, 0xFFFFFF, 1);
            this.bullet.moveTo(0, this.inc * 2);
            this.bullet.lineTo(0, this.inc * 2 + 10);
        }
    }
}

class vessel {

    constructor(x, y, color, weight){
        this.life = 100;
        this.x = x;
        this.y = y;
        this.color = color;
        this.weight = weight;
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;
        this.lines = [];
        this.rotation = 0;

        var line0 = new PIXI.Graphics();
        line0.lineStyle(weight, color, 1);
        line0.moveTo(-15, -10);
        line0.lineTo(15, -10);
        this.lines.push(line0);
        this.container.addChild(line0);

        var line1 = new PIXI.Graphics();
        line1.lineStyle(weight, color, 1);
        line1.moveTo(-15, -10);
        line1.lineTo(0, 30);
        this.lines.push(line1);
        this.container.addChild(line1);

        var line2 = new PIXI.Graphics();
        line2.lineStyle(weight, color, 1);
        line2.moveTo(15, -10);
        line2.lineTo(0, 30);
        this.lines.push(line2);
        this.container.addChild(line2);

        vesselList.push(this);
        stage.addChild(this.container);
    }

    update(){
        this.container.x = this.x;
        this.container.y = this.y;
    }

    rotate(rotation){
        this.container.rotation = rotation;
        this.rotation = rotation;
    }
    fire(){
        var bul = new bullet(this.x, this.y, this.rotation);
    }

}

class player extends vessel{
    update(){
        super.update();
        var deltaX = mousePos.x - this.x;
        var deltaY = mousePos.y - this.y;
        var angle = Math.atan(deltaX/deltaY);
        var rot = - angle;
        if(deltaY < 0){
            rot = rot - Math.PI;
        }
        this.rotate(rot);
        playerPos.x = this.x;
        playerPos.y = this.y;
    }
}

class enemy extends vessel{
    moveForward(speed){
        this.y = this.y + speed * (Math.cos(this.rotation));
        this.x = this.x + speed * (-Math.sin(this.rotation));
    }
    rotateToPlayer(){
        var deltaX = playerPos.x - this.x;
        var deltaY = playerPos.y - this.y;
        var angle = Math.atan(deltaX/deltaY);
        var rot = - angle;
        if(deltaY < 0){
            rot = rot - Math.PI;
        }
        this.rotate(rot);
    }
    constructor(x,y,color,weight){
        super(x,y,color,weight);
        var self = this;
        setInterval(function () {
            self.fire();
        }, 1000);
    }


}

var ply = new player(600, 500, 0xFFFFFF, 1);
var ennemy = new enemy(200, 300, 0xFFFF00, 1);

renderer.render(stage);

document.getElementsByTagName("CANVAS")[0].onclick = function(){
    ply.fire();
};

document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

function onKeyDown(e) {
    if(e.key == 'z'){
        control.top = true;
    }else if(e.key == 's'){
        control.down = true;
    }else if(e.key == 'q'){
        control.left = true;
    }else if(e.key == 'd'){
        control.right = true;
    }
}

function onKeyUp(e) {
    if(e.key == 'z'){
        control.top = false;
    }else if(e.key == 's'){
        control.down = false;
    }else if(e.key == 'q'){
        control.left = false;
    }else if(e.key == 'd'){
        control.right = false;
    }
}

function fpsLoop(){
    setTimeout(function(){
        //$("#fps span").html(Math.round(60/(fps)) + "");
        $("#fps span").html(Math.round(ticker.FPS * 10)/10 + "");
        fpsLoop();
    },100);
}


var ticker = new PIXI.ticker.Ticker();
ticker.add(update, this);
ticker.start();

fpsLoop();
function update(){
    mousePos.x = renderer.plugins.interaction.mouse.global.x;
    mousePos.y = renderer.plugins.interaction.mouse.global.y;
    for(var i = 0; i < vesselList.length; i++){
        vesselList[i].update();
    }
    for(var i = 0; i < bulletList.length; i++){
        bulletList[i].update();
    }
    if(control.top){
        ply.y = ply.y - 3;
    }
    if(control.down){
        ply.y = ply.y + 3;
    }
    if(control.left){
        ply.x = ply.x - 3;
    }
    if(control.right){
        ply.x = ply.x + 3;
    }
    ennemy.rotateToPlayer();
    ennemy.moveForward(1.5);
    renderer.render(stage);
    //requestAnimationFrame(update);
}