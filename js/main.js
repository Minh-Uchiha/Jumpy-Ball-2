import { showManual, startGame } from './manual.js'
import {updateScoreCanvas, showPanel} from './score_panel.js'
import { chooseColors, openSettings } from './settings.js'

const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const btnStart = document.querySelector('.start')
const panel = document.querySelector('.score_panel')

// Score
let score = 0;
const PILLAR_VALUE = 10;
const COIN_VALUE = 20;

// Loading circles stats
const LOAD_RAD = 30, LOAD_CIRCLE_WIDTH = 10
let LOAD_FIRST_X = innerWidth - LOAD_RAD - 30, LOAD_FIRST_Y = 20 + LOAD_RAD;
let LOAD_SEC_X = LOAD_FIRST_X - 2*LOAD_RAD - 50, LOAD_SEC_Y = LOAD_FIRST_Y;
let peneHappen = false;

// Player stats
const PLAYER_SPEED = 3.5, ACCELERATION = 0.05, DIST = 150 ;
const PLAYER_RADIUS = 20;
const PENETRATION_TIME = 1000, GROW_TIME = 800;

const playerColors = ['#225dbd', '#e02424', '#abf00c']
let playerColor = 0;

// Obstacles stats
const PILLAR_COLOR = "rgba(255, 255, 255, 0.7)"
const PILLAR_GENERATE_SPEED = 2000, PILLAR_WIDTH = 60;

// Item stats
const ITEM_RADIUS = 18;
const COIN_COLOR = '#f0d332';
const PENETRATION_PILL_COLOR = 'rgba(42, 219, 232, 1)', PENETRATION_PILL_GENERATE_SPEED_LB = 10000, PENETRATION_PILL_GENERATE_SPEED_UB = 15000
const PENETRATION_PILL_SHADOW_COLOR = 'rgba(42, 219, 232, 1)', SHADOW_BLUR_RADIUS = 30;
const GROW_PILLS_COLOR = '#27c434'
const GROW_PILL_GENERATE_SPEED_LB = 8000, GROW_PILL_GENERATE_SPEED_UB = 10000;
const GROW_AMOUNT = 4;

// The moving speed of canvas
const CANVAS_MOVING_SPEED = 2

// Arrays to store items
let coins = [], growPills = [], penetrationPills = [];

// Create an array to cotain pillars
let pillars = [];

// Create interval variables 
let coins_interval, pillars_interval, penetrate_pills_interval, grow_pill_interval;

// Setting the width and height of the canvas to fullscreen
function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    LOAD_FIRST_X = innerWidth - LOAD_RAD - 30
    LOAD_FIRST_Y = 20 + LOAD_RAD;
    LOAD_SEC_X = LOAD_FIRST_X - 2*LOAD_RAD - 50
    LOAD_SEC_Y = LOAD_FIRST_Y;

}

// Create Player class
class Player {

    constructor(x, y, radius, color, speed, acceleration) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.speed = speed;
        this.acceleration = acceleration;
        this.grow = 0;
        this.penetrate = 0;
    }

    jump() {
        this.speed = PLAYER_SPEED;
        if ( this.speed > 0 ) this.speed *= -1;
    }

    moveLeft() {
        this.x --;
    }

    moveRight() {
        this.x ++;
    }

    setSpeed(s) {
        this.speed = s;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.fillStyle = this.color;
        c.fill();
        c.closePath();
    }

    update() {
        this.draw();
        this.speed += this.acceleration;
        this.y += this.speed;
        if ( this.grow > 0 ) this.grow --;
        if ( this.penetrate > 0 ) this.penetrate --;
    }

}

// Create pillar class
class Pillar {

    constructor(x) {
        this.x = x;
        this.width = PILLAR_WIDTH;
        this.height = Math.random()*(canvas.height - 250) + 50;
        this.dist = DIST;
        this.isPassed = false;
    }

    draw() {
        c.fillStyle = PILLAR_COLOR;
        c.fillRect(this.x, 0, this.width, this.height);
        c.fillRect(this.x, this.height + this.dist, this.width, canvas.height - this.dist - this.height)
    }

    update() {
        this.draw() 
        this.x -= CANVAS_MOVING_SPEED;
    }

}

// Create Coin class
class Coin {

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = ITEM_RADIUS;
        this.color = COIN_COLOR;
        this.shadow_blur_radius = SHADOW_BLUR_RADIUS;
        this.shadow_color = COIN_COLOR;
        this.alpha = 1;
        this.isEaten = false;
    }

    draw() {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.shadowBlur = this.shadow_blur_radius;
        c.shadowColor = this.shadow_color;
        c.fillStyle = this.color;
        if ( this.isEaten === true ) {
            c.globalAlpha = this.alpha;
            this.alpha -= 0.03;
            this.radius += 3;
            this.color = '#fff'
        }
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x -= CANVAS_MOVING_SPEED;
    }

}

// Create growPill class
class GrowPill {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = ITEM_RADIUS;
        this.color = GROW_PILLS_COLOR;
        this.shadow_color = GROW_PILLS_COLOR;
        this.shadow_blur_radius = SHADOW_BLUR_RADIUS;
        this.alpha = 1;
        this.isEaten = false;
    }

    draw() {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.shadowBlur = this.shadow_blur_radius;
        c.shadowColor = this.shadow_color;
        c.fillStyle = this.color;
        if ( this.isEaten === true ) {
            c.globalAlpha = this.alpha;
            this.alpha -= 0.03;
            this.radius += 3;
            this.color = '#fff'
        }
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x -= CANVAS_MOVING_SPEED;
    }
}

// Create Penetration Pill class
class PenetrationPill {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = ITEM_RADIUS;
        this.color = PENETRATION_PILL_COLOR;
        this.shadow_color = PENETRATION_PILL_SHADOW_COLOR;
        this.shadow_blur_radius = SHADOW_BLUR_RADIUS;
        this.alpha = 1;
        this.isEaten = false;
    }

    draw() {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
        c.shadowBlur = this.shadow_blur_radius;
        c.shadowColor = this.shadow_color;
        c.fillStyle = this.color;
        if ( this.isEaten === true ) {
            c.globalAlpha = this.alpha;
            this.alpha -= 0.03;
            this.radius += 3;
            this.color = '#fff'
        }
        c.fill();
        c.restore();
    }

    update() {
        this.draw();
        this.x -= CANVAS_MOVING_SPEED;
    }
}

// Loading circle for grow pills
class LoadGrow {
    constructor() {
        if ( peneHappen === true ) {
            this.x = LOAD_SEC_X;
            this.y = LOAD_SEC_Y
        } else {
            this.x = LOAD_FIRST_X;
            this.y = LOAD_FIRST_Y;
        }
        this.radius = LOAD_RAD;
        this.line_width = LOAD_CIRCLE_WIDTH;
        this.color = GROW_PILLS_COLOR;
        this.due = Math.PI*2;
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 - this.due, false)
        c.lineWidth = this.line_width;
        c.strokeStyle = this.color;
        c.stroke();
    }

    update() {
        this.draw();
        if ( peneHappen === false ) {
            this.x = LOAD_FIRST_X
            this.y = LOAD_FIRST_Y
        } else {
            this.x = LOAD_SEC_X
            this.y = LOAD_SEC_Y
        }
        if ( this.due < Math.PI*2 ) this.due += Math.PI*2/GROW_TIME;
        else {
            this.due = Math.PI*2
        }
    }

}

// Loading circle for penetrate pills
class LoadPenetrate {
    constructor() {
        this.x = LOAD_FIRST_X;
        this.y = LOAD_FIRST_Y;
        this.radius = LOAD_RAD;
        this.line_width = LOAD_CIRCLE_WIDTH;
        this.color = PENETRATION_PILL_COLOR;
        this.due = Math.PI*2;
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI*2 - this.due, false)
        c.lineWidth = this.line_width;
        c.strokeStyle = this.color;
        c.stroke();
    }

    update() {
        this.draw();
        if ( this.due < Math.PI*2 ) this.due += Math.PI*2/PENETRATION_TIME;
        else {
            peneHappen = false;
            this.due = Math.PI*2
        }
    }

}

// Create grow & penetration loading circles
let grow_circle, penetrate_circle;


// Create player
let player;

// Input
addEventListener('keydown', e => {
    switch(e.key) {
        case "ArrowUp":
            player.jump();
            break;
        case "ArrowRight":
            player.moveRight();
            break;
        case "ArrowLeft":
            player.moveLeft();
        default:
            return;
    }
})

export function changeColor(index) {
    playerColor = index;
}

startGame();

showManual();

openSettings();

chooseColors();

function init() {
    setCanvasSize();
    player = new Player(canvas.width/2, canvas.height/2, PLAYER_RADIUS, playerColors[playerColor], 0, ACCELERATION);
    growPills = []
    penetrationPills = []
    coins = []
    pillars = []
    grow_circle = new LoadGrow()
    penetrate_circle = new LoadPenetrate()
    score = 0;

    clearInterval(pillars_interval)
    clearInterval(coins_interval);
    clearInterval(penetrate_pills_interval);
    clearInterval(grow_pill_interval);

    generatePillars();
    generateCoins();
    generateGrowPills()
    generatePenetratePills();

    animate();
}

// Add functionality to start button
btnStart.addEventListener( 'click', () => {
    panel.style.display = 'none';

    init();

})

// Generate a new pillar every some amount of miliseconds
function generatePillars() {
    pillars_interval = setInterval( () => {
        pillars.push( new Pillar(canvas.width) );
    }, PILLAR_GENERATE_SPEED);
}

// Generate a coin every random amount of seconds
function generateCoins() {
    let coin_x, coin_y;
    coins_interval = setInterval( () => {
        coin_x = canvas.width + Math.random()*500 + 100;
        coin_y = Math.random()*(canvas.height - 400) + 200; 
        coins.push(new Coin(coin_x, coin_y));
    }, Math.random()*2000 + 4000)
}

// Function to generate a penetrate pill every random amount of seconds
function generatePenetratePills() {
    let pene_pill_x, pene_pill_y;
    penetrate_pills_interval = setInterval( () => {
        pene_pill_x = canvas.width + Math.random()*500 + 100;
        pene_pill_y = Math.random()*(canvas.height - 400) + 200; 
        penetrationPills.push( new PenetrationPill(pene_pill_x, pene_pill_y))
    }, Math.random()*(PENETRATION_PILL_GENERATE_SPEED_UB - PENETRATION_PILL_GENERATE_SPEED_LB) + PENETRATION_PILL_GENERATE_SPEED_LB)
}

// Function to generate a grow pill every random amount of seconds
function generateGrowPills() {
    let grow_x, grow_y;
    grow_pill_interval = setInterval( () => {
        grow_x = canvas.width + Math.random()*500 + 100;
        grow_y = Math.random()*(canvas.height - 400) + 200; 
        growPills.push( new GrowPill(grow_x, grow_y))
    }, Math.random()*(GROW_PILL_GENERATE_SPEED_UB - GROW_PILL_GENERATE_SPEED_LB) + GROW_PILL_GENERATE_SPEED_LB)
}


let animationId;

// Game loop
function animate() {
    animationId = requestAnimationFrame(animate);

    c.fillStyle = 'rgba(0, 0, 0, 1)'
    c.fillRect(0, 0, canvas.width, canvas.height);

    // Set canvas size each frame
    setCanvasSize();

    // Update score each frame
    updateScoreCanvas(score)

    // Draw player each frame
    player.update();

    // Update loading circles
    grow_circle.update();
    penetrate_circle.update();

    if( player.grow == 0 ) {
        gsap.to(player, {
            radius: PLAYER_RADIUS
        })
    }

    // Spawn coins
    coins.forEach( (coin, index) => {
        if ( coin.alpha <= 0 ) {
            coins.splice(index, 1);
            score += COIN_VALUE;
            return;
        }
        coin.update();
        // Check collision with player
        let dist = Math.hypot(coin.x - player.x, coin.y - player.y);
        if ( dist < coin.radius + player.radius ) {
            coin.isEaten = true;
        }

        // Erase any coin that is spawned inside a pillar
        pillars.forEach( pillar => {
            if ( coin.y - coin.radius < pillar.height || coin.y + coin.radius > pillar.height + pillar.dist ) {
                if ( coin.x + coin.radius >= pillar.x && coin.x - coin.radius <= pillar.x + pillar.width) {
                    coins.splice(index, 1);
                    return;
                }
            }
        })
    })
    
    // Spawn penetration pills
    penetrationPills.forEach( (pene_pill, index) => {
        if ( pene_pill.alpha <= 0 ) {
            penetrationPills.splice(index, 1);
            return;
        }
        pene_pill.update();
        // Check collision with player
        let dist = Math.hypot(pene_pill.x - player.x, pene_pill.y - player.y);
        if ( dist < pene_pill.radius + player.radius ) {
            pene_pill.isEaten = true;
            player.penetrate = PENETRATION_TIME;
            penetrate_circle.due = 0;
            peneHappen = true;
        }

        // Erase any penetration pill that is spawned inside a pillar
        pillars.forEach( pillar => {
            if ( pene_pill.y - pene_pill.radius < pillar.height || pene_pill.y + pene_pill.radius > pillar.height + pillar.dist ) {
                if ( pene_pill.x + pene_pill.radius >= pillar.x && pene_pill.x - pene_pill.radius <= pillar.x + pillar.width) {
                    penetrationPills.splice(index, 1);
                }
            }
        })
    })

    // Spawn grow pills
    growPills.forEach( (growPill, index) => {
        if ( growPill.alpha <= 0 ) {
            growPills.splice(index, 1);
            return;
        }
        growPill.update();
        // Check collision with player
        let dist = Math.hypot(growPill.x - player.x, growPill.y - player.y);
        if ( dist < growPill.radius + player.radius ) {
            growPill.isEaten = true;
            player.grow = GROW_TIME;
            gsap.to(player, {
                radius: player.radius + GROW_AMOUNT
            })
            grow_circle.due = 0;
        }
        // Erase any grow pill that is spawned inside a pillar
        pillars.forEach( pillar => {
            if ( growPill.y - growPill.radius < pillar.height || growPill.y + growPill.radius > pillar.height + pillar.dist ) {
                if ( growPill.x + growPill.radius >= pillar.x && growPill.x - growPill.radius <= pillar.x + pillar.width) {
                    growPills.splice(index, 1);
                }
            }
        })
    })

    // Draw pillars each frame 
    pillars.forEach( pillar => {
        pillar.update()

        // Check if the ball hits the pillar or not
        if ( player.penetrate == 0 && (player.y - player.radius <= pillar.height || player.y + player.radius >= pillar.height + pillar.dist) ) {
            if ( player.x + player.radius > pillar.x && player.x - player.radius < pillar.x + PILLAR_WIDTH) {
                cancelAnimationFrame(animationId);
                showPanel(score)
            }
        }
        if ( pillar.isPassed === false ) {
            if ( player.x - player.radius > pillar.x + pillar.width) {
                pillar.isPassed = true;
                score += PILLAR_VALUE;
            }
        }
        if ( player.y - player.radius - 300 > canvas.height ) {
            cancelAnimationFrame(animationId);
            showPanel(score)
        }
    })
    // Remove pillars that are out of sight
    if ( pillars.length != 0 && pillars[0].x + pillars[0].width < 0 ) pillars.shift();
    if ( coins.length != 0 && coins[0].x + ITEM_RADIUS < 0 ) coins.shift();
    if ( penetrationPills.length != 0 && penetrationPills[0].x + ITEM_RADIUS < 0 ) penetrationPills.shift();
    if ( growPills.length != 0 && growPills[0].x + ITEM_RADIUS < 0 ) growPills.shift();

}
