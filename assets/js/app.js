let canvas = document.getElementById('board');
/* @type {canvasRenderingContext2D} */
let ctx = canvas.getContext('2d');

// Global settings
(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
    var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();

var animationID;

// Variables
let spriteBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAHMBAMAAACXQrP6AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAG1BMVEUAAAD+WT3/qQDW/wB3/zUE95twkr5/f3/////eXqsQAAAAAXRSTlMAQObYZgAAAAFiS0dECIbelXoAAAAJcEhZcwAAEnQAABJ0Ad5mH3gAAAAHdElNRQflCRUDJhVMzzzbAAACV0lEQVRo3u3UO46DMBAG4AmEbAs3QHuCSLkABQegSZ8q9XZcf6MA8dgeY1Dwb0swBfLjQxqPH0RjnKohSnJEXDBN8SihoHIFHJRjsqVKGg7i1kFtGE9UPDRBwTDMv1hQCX+czEoGBicHEFdSVccL4wSAi6N6egMPAMv8BqgNK2nPLwyrV6nfeziYz5Ao+1VRpwn4tEiCA3PaIsHBNJD9Gi04EAIIpmLVVgsJMqFQNRTogwwDQeYARrn4yXaUOjbg0yIJDsxpi2wDPCdqBw+IF0zFqq0WEng2CwLE3QQDb5JE+e3q7CUBbu+uGszH/g0MXl0trnDwGdJbcCAEEJBVpiFVgoL490L6IzdXER+kUKgFwL7+eJDPHzgA2ObimA/IGsCHtdZKMPOALAApvPZX4dBiAd8wsncyJUB0bodoiFIE0xSPBgpaV8BBMybbqKThIG4d1IbxRMVDExQMw/yLBa3wx9msZGBwdgBxJW17vDBOALg4qqc38ACwzG+A2rCG9vzCsHo1+r2Hg/kMiYq7ii5NwKdFEhyY0xYJDqaB4m604EAIIJiK1VktJCiEQnVQoA8yDASFAxjl4ifbUerYgE+LJDgwpy2yDfCcqB08IF4wFauzWkjg2SwIEHcTDLxJEl2eD2cvCfB8d9XgZew/weDV1eIBB58hvQUHQgABWWUaUiUoiH8vpD8u5irigxQKtQDY1x8PLvMHDgC2uTjmA7IG8GGttRLMPCALQAqv/UM4tFjAN4zsnUwJfKLviRIH/Tv2CnpngMBPPxt/B9gXoHlARxyxbfwDQ5iZuz9N/0wAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjEtMDktMjFUMDM6Mzg6MTIrMDA6MDDTacU1AAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIxLTA5LTIxVDAzOjM4OjEyKzAwOjAwojR9iQAAAABJRU5ErkJggg==';
const tank = new Image();
tank.src = spriteBase64;
const invader = new Image();
invader.src = spriteBase64;
var startScreenTimeout;

var frameCount = 0;
var armyPrevFrameCount = 0;
var framesInOneSec = 1000/16;
var spriteUnitHeight = 34;
var spriteUnitWidth = 64;
var scoreBarHeight = 50;
var tankBottomOffset = (spriteUnitHeight/2) + scoreBarHeight;
var tankX = canvas.width/2;
var tankdX = 4;
var tankY = canvas.height - (tankBottomOffset);
var tankWidth = spriteUnitWidth/2;
var tankHeight = spriteUnitHeight/2;
var keys = [];

// Scores and lives
var score = 0;
var allowedLives = 3;
var lives = allowedLives;
var hasLifeDecreased = false;
var gameRunning = false;

// Invaders board
var invaderWidth = spriteUnitWidth/2.5;
var invaderHeight = spriteUnitHeight/2.5;
var invaderSpriteHeight = spriteUnitHeight;
var invaderSpriteHeightsArray = [[0, 34], [68, 102], [136, 170], [204, 238], [272, 307], [341, 374]];
var spriteSelector = 0;
var armyRows = 6;
var armyColumns = 10;
var armyX = 60;
var armyY= 60;
var invaderLeftOffset = 15;
var invaderTopOffset = 20;
var armyDirection = 'right';
var armyDx = 8;
var armyDy = 8;
var armySpeed = 40;
var armySpeedDecrement = 8;
let aliveInvaders = armyColumns * armyRows;
var armyInvaderBulletSpeed = 4;
var armyArray = [];

// Bullets
var bulletHeight = 10;
var bulletWidth = 3;
var tankBulletX;
var tankBulletY;
var shouldMoveTankBullet = false;
var tankBulletDy = 10;
var invaderBulletsArray = [];
var invBulletDy = 5;
var invBulletPrevFrameCount = 0;

// Explosion
const background = '#fff';
var particleExplosion = 50;
const particlesMinSpeed = 1;
const particlesMaxSpeed = 6;
const particlesMinSize = 1;
var particlesMaxSize = 8;
const explosions = [];
var explosionColor = 'gray';
let fps = 60;
const interval = 1000/fps;
let now, delta;
let then = Date.now();

// Sounds
const start = new Audio('./assets/music/start.mp3');
const win = new Audio('./assets/music/win.mp3');
const gameOver = new Audio('./assets/music/gameover.mp3');

// Optimization for mobiles
if (/Android|WebOS|iPad|ipod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
    fps = 29;
};

// Game loop
window.addEventListener('load', function() {
    drawStartScreen();
});

function startGame() {
    clearInterval(startScreenTimeout);
    start.play();
    gameRunning = true;
    gameInit();
    constructArmy(armyX, armyY);
    gameLoop();
};

function gameInit() {
    invaderBulleysArray = [];
    armyArray = [];
    score = 0;
    lives = allowedLives;
    armyDirection = 'right';
    aliveInvaders = armyColumns * armyRows;
    frameCount = 0;
    armyPrevFrameCount = 0;
    invBulletPrevFrameCount = 0;
    hasLifeDecreased = false;
    armySpeed = 40;
};

function gameLoop() {
    if (lives <= 0 || !gameRunning) {
        gameRunning = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawScore();
        drawLives();
        gameOver.play();
        drawGameOver('You Lost!');
        drawBottomHelper();
        return false;
    }

    if (aliveInvaders == 0) {
        gameRunning = false;
        win.play();
        drawGameOver('You Won!!!');
        drawBottomHelper();
        return false;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    helperHandler();
    drawScoreSeparateLine();
    drawScore();
    drawLives();
    moveArmy();
    drawArmyOfInvaders();
    keyPressed();
    drawTank(tankX, tankY);

    if (shouldMoveTankBullet) {
        drawBullet(tankBulletX, tankBulletY);
        moveTankBullet();
    }
    invadersBulletHandler();
    animationID = requestAnimationFrame(gameLoop);
    frameCount++;

    now = Date.now();
    delta = now - then;

    if (delta > interval) {
        then = now - (delta % interval);
        drawExplosion();
    }
};

// Events
window.addEventListener('keydown', () => keys[event.keyCode] = true);
window.addEventListener('keyup', () => keys[event.keyCode] = false);
window.addEventListener('keypress', keypressedHandler);

function keyPressed() {
    if (keys[37]) {
        if (tankX - tankdX > 0) {
            tankX -= tankdX;
        }
    }

    if (keys[39]) {
        if (canvas.width - (tankX + tankWidth)) {
            tankX += tankdX;
        }
    }

    if (keys[88] || keys[32]) {
        if (!shouldMoveTankBullet) {
            fireTankBullet();
        }
    }
};

function keypressedHandler() {
    if (event.keyCode == '13' && !gameRunning) {
        startGame();
    }
};

// Handlers
function invadersBulletHandler() {
    if (invaderBulletsArray.length<3 && frameCount - invBulletPrevFrameCount > (armySpeed * armyInvaderBulletSpeed)) {
        generateInvaderRandomBullet();
        invBulletPrevFrameCount = frameCount;
    }
    moveInvaderBullets();
};

function generateInvaderRandomBullet() {
    let aliveArmy = [];
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            if (soldier.status == 'alive') {
                aliveArmy.push(armyArray[i][j]);
            }
        }
    }

    let rInvader = aliveArmy[getRandomNumber(aliveArmy.length)];
    if (rInvader.status == 'alive') {
        let iBullet = {
            x: rInvader.x + invaderWidth / 2,
            y: rInvader.y + invaderHeight
        };
        invaderBulletsArray.push(iBullet);
        drawInvaderBullet(iBullet.x, iBullet.y);
    }
};

function getRandomNumber(rng) {
    return Math.floor(Math.random()*rng);
};

function moveInvaderBullets() {
    for (let i = 0; i < invaderBulletsArray.length; i++) {
        let iB = invaderBulletsArray[i];
        iB.y = iB.y + invBulletDy;

        if (iB.y > canvas.height) {
            invaderBulletsArray.splice(i, 1);
        }

        if (iB.x > tankX && iB.x < tankX + tankWidth && iB.y > tankY && iB.y < tankY + tankHeight) {
            explosionColor = 'gray';
            particleExplosion = 150;
            particlesMaxSize = 4;
            triggerExplosion(tankX+tankWidth / 2, tankY+tankHeight / 2);
            invaderBulletsArray.splice(i, 1);
            lives--;
            hasLifeDecreased = true;
        }
        drawInvaderBullet(iB.x, iB.y);
    }
};

function helperHandler() {
    if (aliveInvaders == armyColumns * armyRows) {
        drawBottomMessage('Press SPACE to fire', 150);
    }
    else {
        if (hasLifeDecreased) {
            drawBottomMessage(`HIT! Lives left: ${lives}`, 150);
            setTimeout(() => {
                hasLifeDecreased = false;
                drawBottomMessage(``, 150)
            }, 2000);
        }
    }
};

// Draw functions
function drawInvader(x, y, sHeight) {
    ctx.beginPath();
    ctx.drawImage(
        invader, 0, sHeight, spriteUnitWidth, spriteUnitHeight, x, y, invaderWidth, invaderHeight
    );
    ctx.closePath();
};

function drawTank(x, y) {
    ctx.beginPath();
    ctx.drawImage(
        tank, 0, tank.height-50, tank.width, spriteUnitHeight, x, y, tankWidth, tankHeight
    );
    ctx.closePath();
};

function moveArmy() {
    if (frameCount - armyPrevFrameCount > armySpeed) {
        armyPrevFrameCount = frameCount;
        invaderSpriteHeight = spriteUnitHeight - invaderSpriteHeight;
        spriteSelector = 1 - spriteSelector;
    } else {
        return false;
    }
    let dx;
    let dy = 0;
    if (armyDirection == 'right') {
        if (canvas.width - (armyX + (invaderWidth + invaderLeftOffset) * (armyColumns-1)) > invaderWidth) {
            dx = 1;
        } else {
            armyDirection = 'left';
            dx = -1;
            dy = armyDy;
        }
    } else {
        if (armyDirection == 'left') {
            if (armyX-armyDx>0) {
                dx = -1;        
            } else {
                armyDirection = 'right';
                dx = 1;
                dy=armyDy;
            }  
        }
    }
    armyX += armyDx * (dx);
    updateArmy(dx * (armyDx), dy);
};

function constructArmy(aX, aY){
    for (let i = 0; i < armyRows; i++) {
        armyArray[i] = [];
        for(let j = 0; j < armyColumns; j++){
            armyArray[i][j] = {
            x: aX + j*(invaderWidth + invaderLeftOffset),
            y: aY + i*(invaderHeight + invaderTopOffset),
            status: 'alive'
            };
        }
    }
};

function updateArmy(adx, ady) {
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            soldier.x = soldier.x + (adx);
            soldier.y = soldier.y + (ady);
        }
    }
};

function drawArmyOfInvaders() {
    for (let i = 0; i < armyRows; i++) {
        for (let j = 0; j < armyColumns; j++) {
            let soldier = armyArray[i][j];
            if (soldier.status == 'alive') {
                drawInvader(soldier.x, soldier.y, invaderSpriteHeightsArray[i][spriteSelector]);
                if (soldier.y > tankY) {
                    gameRunning = false;
                }
            }
        }
    }
};

function drawBullet(bx, by){
    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx, by - bulletHeight);
    ctx.lineWidth = bulletWidth + 2;
    ctx.strokeStyle = 'gray';
    ctx.stroke();
};

function fireTankBullet() {
    tankBulletX = tankX + tankWidth/2;
    tankBulletY = canvas.height - tankBottomOffset;
    drawBullet(tankBulletX, tankBulletY);
    moveTankBullet();
    shouldMoveTankBullet = true;
};

function moveTankBullet(){
    if(tankBulletY < 0){
        shouldMoveTankBullet= false;      
    }
    for (let i = 0; i < armyRows; i++) {
        for(let j = 0; j < armyColumns; j++){
            let soldier = armyArray[i][j];
            if(
                tankBulletX > soldier.x &&
                tankBulletX < soldier.x + invaderWidth &&
                tankBulletY > soldier.y &&
                tankBulletY < soldier.y + invaderHeight &&
                soldier.status == 'alive'
            ) {
                soldier.status='dead';
                shouldMoveTankBullet=false;
                aliveInvaders--;
                score++;            
                explosionColor = 'gray';
                particlesPerExplosion = 50;
                particlesMaxSize = 3;
                triggerExplosion(soldier.x + invaderWidth / 2, soldier.y + invaderHeight / 2);
                if((aliveInvaders) % armyColumns == 0 && armySpeed > 10){
                    armySpeed -= armySpeedDecrement;
                }
            }       
        }  
    }
    tankBulletY -= tankBulletDy;
};

function drawScoreSeparateLine() {
    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - (scoreBarHeight - 15));
    ctx.lineTo(canvas.width, canvas.height - (scoreBarHeight - 15));
    ctx.lineWidth = 2;
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 1;
    ctx.shadowOffsetY = -1;
    ctx.shadowColor = 'green';
    ctx.strokeStyle = 'green';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowOffsetY = 0;
};

function drawBottomMessage(message, sx) {
    ctx.beginPath();
    ctx.font = '20px Play';
    ctx.fillStyle = 'white';
    ctx.fillText(message, sx, canvas.height - 10);
    ctx.closePath();
};

function drawScore() {
    drawBottomMessage('SCORE: ' + score, canvas.width - 95);
};

function drawLives() {
    drawBottomMessage('LIVES: ' + lives, 10);
};

function drawBottomHelper() {
    drawBottomMessage('Press ENTER to play', 150);
};

function drawInvaderBullet(ix, iy) {
    ctx.beginPath();
    ctx.beginPath();
    ctx.moveTo(ix, iy);
    ctx.lineTo(ix, iy + bulletHeight);
    ctx.lineWidth = bulletWidth;
    ctx.strokeStyle = '#FFF';
    ctx.stroke();
};

function drawGameOver(message){
    drawBlinker(function(){ drawScreenLine1('Game Over') }, function(){ drawScreenLine2(message) });
};

function drawBlinker(funct1, funct2) {
    let counter = 0;
    startScreenTimeout = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height - 50);
        funct1();
        if (counter % 3 == 0) {
            funct2();
        }
        counter++;
    }, 400);
};

function drawStartScreen() {
    drawBlinker(function(){ drawScreenLine1('Pixel Invaders') }, function(){ drawScreenLine2('Press ENTER to play...') });
};

function drawScreenLine1(message) {
    ctx.save();
    ctx.beginPath();
    ctx.font = '60px Play';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);  
    ctx.closePath();
    ctx.restore();
};

function drawScreenLine2(message) {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = 'green';
    ctx.textAlign = 'center';
    ctx.font = '40px Play';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 60);  
    ctx.closePath();
    ctx.restore();
};

// Draw explosions
function drawExplosion() {
    if (explosions.length === 0) {
        return;
    }
    for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        const particles = explosion.particles;
        if (particles.length === 0) {
            explosions.splice(i, 1);
            return;
        }
        const particlesAfterRemoval = particles.slice();
        for (let ii = 0; ii < particles.length; ii++) {
            const particle = particles[ii];
            if (particle.size <= 0) {
                particlesAfterRemoval.splice(ii, 1);
                continue;
            }
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, Math.PI * 2, 0, false);
            ctx.closePath();
            ctx.fillStyle = explosionColor;
            ctx.fill();
            particle.x += particle.xv;
            particle.y += particle.yv;
            particle.size -= .1;
        }
        explosion.particles = particlesAfterRemoval;
    }
};

function triggerExplosion(triggerX, triggerY) {
    let xPos, yPos;
    xPos = triggerX;
    yPos = triggerY;
    explosions.push(new explosion(xPos, yPos));
};

function explosion(x, y) {
    this.particles = [];
    for (let i = 0; i < particleExplosion; i++) {
        this.particles.push(new particle(x, y));
    }
};

function particle(x, y) {
    this.x = x;
    this.y = y;
    this.xv = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.yv = randInt(particlesMinSpeed, particlesMaxSpeed, false);
    this.size = randInt(particlesMinSize, particlesMaxSize, true);
    this.r = randInt(113, 222);
    this.g = '00';
    this.b = randInt(105, 255);
};

// Random integer
function randInt(min, max, positive) {
    let num;
    if (positive === false) {
        num = Math.floor(Math.random() * max) - min;
        num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
    } else {
        num = Math.floor(Math.random() * max) + min;
    }
    return num;
};