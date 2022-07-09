let WINDOW_WIDTH = window.innerWidth;
let WINDOW_HEIGHT = window.innerHeight;
const W = 1000;
const H = 600;
const keys = {up:false, down:false, left:false, right:false};

const ground = H-50;
const goalHeight = 200;
let playerL, playerR, ball;

function setup() {
    let canvas = createCanvas(W,H);
    canvas.parent("world");
    background(255);
    frameRate(60);
    
    playerL = new Player(true);
    playerR = new CPU(false);
    ball = new Ball();

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);
}
let rate = 0;
function draw() {
    if (frameCount % 5 == 0) rate = round(frameRate());
    background(255);
    
    playerInput(playerL);
    playerR.think(ball);
    playerL.update();
    playerR.update();
    ball.update();
    playerL.collide(playerR);
    ball.collide(playerL, playerR);

    drawGoals();
    drawGround();

    playerL.show();
    playerR.show();
    ball.show();
    if (frameCount%120 == 0) {
        //playerR.up();
    }

    strokeWeight(0);
    fill(0);
    text(rate + " FPS", 10, 20);
}
function playerInput(player) {
    if (keys.up) {
        player.up();
    }
    if (keys.right) {
        player.right();
    }
    if (keys.left) {
        player.left();
    }
}
function drawGoals() {
    strokeWeight(60);

    stroke(255, 0, 0);
    line(0, ground, 0, ground - goalHeight);

    stroke(0, 0, 255);
    line(W, ground, W, ground - goalHeight);
}
function drawGround() {
    noStroke();
    fill(0, 200, 0);
    rect(0, ground, W, H-ground);
}
class Ball {
    constructor() {
        this.x = W/2;
        this.y = 100;
        this.vx = random(-5, 5);
        this.vy = 0;
        this.radius = 40;
        this.gravity = 0.5;
        this.bounciness = 15;
        this.inGoal = 0;
    }
    show() {
        fill(200,50,200);
        noStroke();
        ellipse(this.x, this.y, this.radius*2, this.radius*2);
    }
    update() {
        //if (this.inGoal != 0) return;
        this.vx *= 0.99999;
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;

        if (this.y + this.radius > ground) {
            this.y = ground - this.radius;
            this.vy = -abs(this.vy) * 0.9;
        }
        if (this.x - this.radius< 0) {
            this.x = this.radius;
            this.vx = abs(this.vx);
            if (this.y > ground - goalHeight) {
                this.inGoal = -1;
            }
        }
        if (this.x + this.radius > W) {
            this.x = W - this.radius;
            this.vx = -abs(this.vx);
            if (this.y > ground - goalHeight) {
                this.inGoal = 1;
            }
        }
    }
    collide(a, b) {
        let VX = 0, VY = 0, hit = false;
        const dist_a = dist(this.x, this.y, a.x, a.y);
        const dist_b = dist(this.x, this.y, b.x, b.y);
        if (dist_a < this.radius + a.radius) {
            hit = true;
            const dx = this.x - a.x;
            const dy = this.y - a.y;
            const _d = dist(0, 0, dx, dy);
            VX += dx/_d * this.bounciness + a.vx * 0.5;
            VY += dy/_d * this.bounciness;
        }
        if (dist_b < this.radius + b.radius) {
            hit = true;
            const dx = this.x - b.x;
            const dy = this.y - b.y;
            const _d = dist(0, 0, dx, dy);
            VX += dx/_d * this.bounciness + b.vx * 0.5;
            VY += dy/_d * this.bounciness;
        }
        if (hit) {
            this.vx = VX;
            this.vy = VY - 3.5;
        }
    }

}
class Player {
    
    constructor(isRed) {
        if (isRed) {
            this.x = 200;
        } else {
            this.x = W-200;
        }
        this.y = H-200;
        this.vx = 0;
        this.vy = 0;
        this.speed = 1;
        this.jumpPower = 14;
        this.radius = 40;
        this.isRed = isRed;
        this.gravity = 0.5;
    }
    show() {
        if (this.isRed) {
            fill(255, 0, 0);
        } else {
            fill(0, 0, 255);
        }
        stroke(0);
        strokeWeight(5);
        ellipse(this.x, this.y, this.radius*2, this.radius*2);
    }
    update() {
        this.vx *= 0.93;
        this.vy += this.gravity;
        this.y += this.vy;
        this.x += this.vx;
        if (this.y + this.radius > ground) {
            this.y = ground - this.radius;
            this.vy = 0;
        }
        if (this.x - this.radius< 0) {
            this.x = this.radius;
            this.vx = abs(this.vx);
        }
        if (this.x + this.radius > W) {
            this.x = W - this.radius;
            this.vx = -abs(this.vx);
        }
    }
    collide(other) {
        const d = dist(this.x, this.y, other.x, other.y);
        if (d > this.radius + other.radius) {
            return;
        }
        // handle overlap
        const overlap = this.radius + other.radius - d;
        const dir = (new Vec(other.x - this.x, other.y - this.y)).normalize();
        const offset = dir.multiply(overlap/2);
        this.x -= offset.x;
        this.y -= offset.y;
        other.x += offset.x;
        other.y += offset.y;
        // handle velocity
        const offsetV = dir.multiply(overlap);
        this.vx -= offsetV.x;
        this.vy -= offsetV.y;
        other.vx += offsetV.x;
        other.vy += offsetV.y;
        //const v1 = new Vec(this.vx, this.vy), v2 = new Vec(other.vx, other.vy);
        //const x1 = new Vec(this.x, this.y), x2 = new Vec(other.x, other.y);
        //const newV1 = v1.subtract((x1.subtract(x2)).multiply( (v1.subtract(v2)).dot(x1.subtract(x2)) / (x1.subtract(x2)). ));
    }
    up() {
        if (this.y + this.radius > ground - 1) {
            this.vy = -this.jumpPower;
        }
    }
    right() {
        this.vx += this.speed;
    }
    left() {
        this.vx -= this.speed;
    }
}
function mutate(x) {
    if (random(1) < 0.1) {
        let offset = randomGaussian() * 0.5;
        let newx = x + offset;
        return newx;
    } else {
        return x;
    }
}
class CPU extends Player {
    constructor(isRed) {
        super(isRed);
        if (isRed instanceof NeuralNetwork) {
            this.brain = isRed.copy();
            this.brain.mutate(mutate);
        } else {
            this.brain = new NeuralNetwork(6, 12, 4);
        }
        this.score = 0;
        this.fitness = 0;
    }
    copy() {
        return new CPU(this.brain);
    }
    think(ball) {
        this.juggler(ball);
    }
    juggler(ball) {
        let leftOrRight = ball.x - this.x + this.radius*2; //  
        if (leftOrRight > 5) {
            this.right();
        } 
        if (leftOrRight < -5) {
            this.left();
        }
    }

}


function nextGeneration() {
    resetGame();
    normalizeFitness();
}











function onKeyDown(event) {
    if (event.defaultPrevented) return;
    switch (event.code) {
      case "KeyS":
      case "ArrowDown":
        keys.down = true;
        break;
      case "KeyW":
      case "ArrowUp":
        keys.up = true;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.left = true;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.right = true;
        break;
    }
}
  function onKeyUp(event) {
    if (event.defaultPrevented) return;
    switch (event.code) {
      case "KeyS":
      case "ArrowDown":
        keys.down = false;
        break;
      case "KeyW":
      case "ArrowUp":
        keys.up = false;
        break;
      case "KeyA":
      case "ArrowLeft":
        keys.left = false;
        break;
      case "KeyD":
      case "ArrowRight":
        keys.right = false;
        break;
    }
}


class Vec {
    constructor(x, y) {
        this.x = float(x);
        this.y = float(y);
    }
    add (b) {
        return new Vec(this.x + b.x, this.y+b.y);
    }
    subtract (b) {
        return new Vec(this.x - b.x, this.y-b.y);
    }
    dot (b) {
        return this.x * b.x + this.y * b.y;
    }
    multiply (n) {
        return new Vec(this.x * n, this.y*n);
    }
    divide(n) {
        return new Vec(this.x / n, this.y / n);
    }
    magnitude() {
        return sqrt(this.dot(this));
    }
    normalize() {
        return this.divide(this.magnitude());
    }
}