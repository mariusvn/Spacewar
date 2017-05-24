renderer = PIXI.autoDetectRenderer(256, 256, {antialias: true, transparent: false, resolution: 2});

console.log("Welcome to Spacewar v0.3");
console.log("By Marius 'DrGEEK' Van Nieuwenhuyse");

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

var deadCountIntro = new PIXI.Text("Kills: ", {fontFamily:'Arial', fontSize:22, fill: 0xFFFFFF, align: 'center'});
deadCountIntro.x = 30;
deadCountIntro.y = 30;
var deadCount = new PIXI.Text("0", {fontFamily:'Arial', fontSize:22, fill: 0xFFFFFF, align: 'center'});
deadCount.y = 30;
deadCount.x = 30 + deadCountIntro.width;
var deadCountInt = 0;

stage.addChild(deadCountIntro);
stage.addChild(deadCount);

renderer.render(stage);

var ticker = new PIXI.ticker.Ticker();
ticker.add(update, this);
ticker.start();

vesselList = [];
bulletList = [];

class bullet{
    constructor(x,y,rotation, owner){
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
        this.owner = owner;
        bulletList.push(this);
        stage.addChild(this.container);
        this.goneOut = false;
        this.timeout = setTimeout(function (self) {
            self.remove();
        }, 3000, this);
    }

    remove(){
        clearTimeout(this.timeout);
        this.bullet.clear();
        var index = bulletList.indexOf(this);
        bulletList.splice(index, 1);
    }

    update(deltatime){
        this.inc = this.inc + 4 * deltatime;
        this.bullet.clear();
        this.bullet.lineStyle(1, 0xFFFFFF, 1);
        this.bullet.moveTo(0, this.inc);
        this.bullet.lineTo(0, this.inc + 10);
        var out = false;
        //collision detection
        var bounds = this.bullet.getBounds();
        if(this.goneOut) {
            for (var i = 0; i < vesselList.length; i++) {
                var vesselBounds = vesselList[i].bounds;
                if (bounds.x > vesselBounds.x && bounds.x < vesselBounds.x + vesselBounds.width) {
                    if (bounds.y > vesselBounds.y && bounds.y < vesselBounds.y + vesselBounds.height) {
                        if (this.goneOut) {
                            this.onHit(vesselList[i]);
                            if(this.owner === ply){
                                deadCountInt++;
                                deadCount.text = deadCountInt.toString();
                            }
                        }
                    }
                }
            }
        }else{
            var vesselBounds = this.owner.bounds;
            if (bounds.x < vesselBounds.x || bounds.x > vesselBounds.x + vesselBounds.width) {
                if (bounds.y < vesselBounds.y || bounds.y > vesselBounds.y + vesselBounds.height) {
                    out = true
                }
            }
            if(out && !this.goneOut){
                this.goneOut = true;
            }
        }
    }

    onHit(hitter){
        this.remove();
        hitter.died();
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
        this.rotation = 0;

        this.line = new PIXI.Graphics();
        this.line.lineStyle(weight, color, 1);
        this.line.moveTo(-15, -10);
        this.line.lineTo(15, -10);
        this.line.moveTo(-15, -10);
        this.line.lineTo(0, 30);
        this.line.moveTo(15, -10);
        this.line.lineTo(0, 30);
        this.container.addChild(this.line);

        vesselList.push(this);
        stage.addChild(this.container);

        this.bounds = this.line.getBounds();
        this.boundsGraphic = new PIXI.Graphics();

        stage.addChild(this.boundsGraphic);
    }

    update(deltaTime){
        this.container.x = this.x;
        this.container.y = this.y;

        this.bounds = this.line.getBounds();
    }

    rotate(rotation){
        this.container.rotation = rotation;
        this.rotation = rotation;
    }
    fire(){
        new bullet(this.x, this.y, this.rotation, this);
    }
    died(){
        var index = vesselList.indexOf(this);
        vesselList.splice(index, 1);
        stage.removeChild(this.container);
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

    died(){
        super.died();
        ticker.stop();
        var text = new PIXI.Text('YOU LOSE', {fontFamily:'Arial', fontSize:72, fill: 0xFFFFFF, align: 'center'});
        text.x = (window.innerWidth - text.width) / 2;
        text.y = (window.innerHeight - text.height) / 2;
        var text2 = new PIXI.Text('Refresh to replay', {fontFamily:'Arial', fontSize:22, fill: 0xFFFFFF, align: 'center'});
        text2.x = (window.innerWidth - text2.width) / 2;
        text2.y = (window.innerHeight - text2.height) / 2 + text.height;
        stage.addChild(text);
        stage.addChild(text2);
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
        this.fireUpdate = setInterval(function () {
            self.fire();
        }, 1000);
    }
    update(deltaTime){
        super.update(deltaTime);
        this.rotateToPlayer();
        this.moveForward((1.5 * deltaTime));
    }
    died(){
        super.died();
        clearTimeout(this.fireUpdate);

    }

}

var ply = new player(600, 500, 0xFFFFFF, 1);

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

function update(deltatime){
    mousePos.x = renderer.plugins.interaction.mouse.global.x;
    mousePos.y = renderer.plugins.interaction.mouse.global.y;
    for(var i = 0; i < vesselList.length; i++){
        vesselList[i].update(deltatime);
    }
    for(var i = 0; i < bulletList.length; i++){
        bulletList[i].update(deltatime);
    }
    if(control.top){
        ply.y = ply.y - (3 * deltatime);
    }
    if(control.down){
        ply.y = ply.y + (3 * deltatime);
    }
    if(control.left){
        ply.x = ply.x - (3 * deltatime);
    }
    if(control.right){
        ply.x = ply.x + (3 * deltatime);
    }

    renderer.render(stage);
    //requestAnimationFrame(update);
}