let canvs = document.getElementById('board');
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
let spriteBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAEACAYAAAADRnAGAAACGUlEQVR42u3aSQ7CMBAEQIsn8P+/hiviAAK8zFIt5QbELiTHmfEYE3L9mZE9AAAAqAVwBQ8AAAD6THY5CgAAAKbfbPX3AQAAYBEEAADAuZrC6UUyfMEEAIBiAN8OePXnAQAAsLcmmKFPAQAAgHMbm+gbr3Sdo/LtcAAAANR6GywPAgBAM4D2JXAAABoBzBjA7AmlOx8AAEAzAOcDAADovTc4vQim6wUCABAYQG8QAADd4dPd2fRVYQAAANQG0B4HAABAawDnAwAA6AXgfAAAALpA2uMAAABwPgAAgPoAM9Ci/R4AAAD2dmqcEQIAIC/AiQGuAAYAAECcRS/a/cJXkUf2AAAAoBaA3iAAALrD+gIAAADY9baX/nwAAADNADwFAADo9YK0e5FMX/UFACA5QPSNEAAAAHKtCekmDAAAAADvBljtfgAAAGgMMGOrunvCy2uCAAAACFU6BwAAwF6AGQPa/XsAAADYB+B8AAAAtU+ItD4OAwAAAFVhAACaA0T7B44/BQAAANALwGMQAAAAADYO8If2+P31AgAAQN0SWbhFDwCAZlXgaO1xAAAA1FngnA8AACAeQPSNEAAAAM4CnC64AAAA4GzN4N9NSfgKEAAAAACszO26X8/X6BYAAAD0Anid8KcLAAAAAAAAAJBnwNEvAAAA9Jns1ygAAAAAAAAAAAAAAAAAAABAQ4COCENERERERERERBrnAa1sJuUVr3rsAAAAAElFTkSuQmCC';
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
var allowedLives = 0;
var lives = allowedLives;
var hasLifeDecreased = false;
var gameRunning = false;

// Invaders board
var invaderWidth = spriteUnitWidth/2.5;
var invaderHeight = spriteUnitHeight/2.5;
var invaderSpriteHeight = spriteUnitHeight;
var invaderSpriteHeightsArray = [[68, 102], [102, 134], [102, 134], [0, 34], [0, 34]];
var spriteSelector = 0;
var armyRows = 5;
var armyColumns = 10;
var armyX = 60;
var armyY= 60;
var invaderLeftOffset = 15;
var invaderTopOffset = 20;
var armyDirection = 'right';
var armyDx = 10;
var armyDy = 10;
var armySpeed = 40;
var armySpeedDecrement = 10;
let aliveInvaders = armyColumns * armyRows;
var armyInvadesBulletSpeed = 4;
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
const particlesMaxSize = 8;
const explosions = [];
var explosions = 'white';
let fps = 60;
const interval = 1000/fps;
let now, delta;
let then = Date.now();

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
    gameRunning = true;
    gameInit();
    construcArmy(armyX, armyY);
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
        drawGameOver('You Lost!');
        drawBottomHelper();
        return false;
    }

    if (aliveInvaders == 0) {
        gameRunning = false;
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
        shouldMoveTankBullet();
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
        if(!shouldMoveTankBullet) {
            fireTankBullet();
        }
    }

    function keypressedHandler() {
        if (event.keyCode == '13' && !gameRunning) {
            startGame();
        }
    };
};

// Handlers
function invadersBulletHandler() {
    if(invaderBulletsArray.length<3 &&  frameCount- invBullet__prevFrameCount>(armySpeed*armyInvaderBulletsSpeed)) {
        generateInvaderRandomBullet();
        invBulletPrevFrameCount = frameCount;
    }
    moveInvaderBullets();
};

//------------ mañana sigo