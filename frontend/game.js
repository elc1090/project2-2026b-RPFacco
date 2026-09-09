import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({
    canvas: document.getElementById("game"),
    width: 440,
    height: 220,
    letterbox: true,
    pixelDensity: window.devicePixelRatio,
    crisp: true,
    background: "#ffffff",
});

loadSpriteAtlas("sprite-sheet.png", {
    "restart": {
        x: 2, y: 2,
        width: 36, height: 32,
    },
    "dino-offline": {
        x: 40, y: 4,
        width: 44, height: 45,
    },
    "cloud": {
        x: 86, y: 2,
        width: 46, height: 14,
    },
    "bird": {
        x: 134, y: 2,
        width: 92, height: 40,
        sliceX: 2,
        anims: {
            fly: { from: 0, to: 1, loop: true, speed: 5 },
        },
    },
    "cactus-small": {
        x: 228, y: 2,
        width: 102, height: 35,
        sliceX: 6,
    },
    "cactus-large": {
        x: 332, y: 2,
        width: 150, height: 50,
        sliceX: 6,
    },
    "moon": {
        x: 484, y: 2,
        width: 160, height: 40,
        sliceX: 8,
    },
    "star": {
        x: 644, y: 2,
        width: 9, height: 27,
        sliceY: 3,
    },
    "numbers": {
        x: 655, y: 2,
        width: 120, height: 13,
        sliceX: 12,
    },
    "game-over": {
        x: 655, y: 15,
        width: 191, height: 11,
    },
    "dino": {
        x: 848, y: 2,
        width: 264, height: 47,
        sliceX: 6,
        anims: {
            idle: { from: 0, to: 1, loop: true, speed: 3 },
            jump: 0,
            run: { from: 2, to: 3, loop: true, speed: 12 },
            dead: 5,
        },
    },
    "dino-duck": {
        x: 1112, y: 19,
        width: 118, height: 30,
        sliceX: 2,
        anims: {
            duck: { from: 0, to: 1, loop: true, speed: 8 },
        },
    },
    "ground": {
        x: 2, y: 54,
        width: 1200, height: 12,
    },
});

const FLOOR_Y = height() - 40;
const FLOOR_THICKNESS = 20;
const GROUND_LINE_OFFSET = 5;
const GROUND_WIDTH = 1200;
const DINO_X = 50;

const SPEED = 140;
const GRAVITY = 600;
const JUMP_FORCE = 300;

const CLOUD_SPEED = 60;
const CLOUD_MIN_Y = 20;
const CLOUD_MAX_Y = 80;
const CLOUD_MIN_DELAY = 2;
const CLOUD_MAX_DELAY = 4;

const CACTUS_SPRITES = ["cactus-small", "cactus-large"];
const CACTUS_MIN_DELAY = 1.8;
const CACTUS_MAX_DELAY = 3.5;

const GAMEOVER_GAP = 24;

const SCORE_RATE = 10;
const SCORE_DIGITS = 5;
const SCORE_DIGIT_WIDTH = 10;
const SCORE_MARGIN = 10;

let gameOver = false;
let score = 0;
let cloudTimer = null;
let cactusTimer = null;

setGravity(GRAVITY);

const bg1 = add([
    sprite("ground"),
    pos(0, FLOOR_Y - GROUND_LINE_OFFSET),
]);
const bg2 = add([
    sprite("ground"),
    pos(GROUND_WIDTH, FLOOR_Y - GROUND_LINE_OFFSET),
]);

add([
    rect(width(), FLOOR_THICKNESS),
    pos(0, FLOOR_Y),
    area(),
    body({ isStatic: true }),
    opacity(0),
]);

const dino = add([
    sprite("dino"),
    anchor("botleft"),
    pos(DINO_X, FLOOR_Y),
    area({ scale: vec2(0.5, 0.8), offset: vec2(10, 0) }),
    body(),
    z(1),
]);

dino.play("run");
onClick(() => {
    if (gameOver) {
        restart();
        return;
    }
    if (!dino.isGrounded()) return;
    dino.jump(JUMP_FORCE);
    dino.play("jump");
});
dino.onGround(() => {
    if (gameOver) return;
    dino.play("run");
});
dino.onCollide("cactus", endGame);

const scoreDigits = [];
for (let i = 0; i < SCORE_DIGITS; i++) {
    scoreDigits.push(add([
        sprite("numbers", { frame: 0 }),
        pos(width() - SCORE_MARGIN - (SCORE_DIGITS - i) * SCORE_DIGIT_WIDTH, SCORE_MARGIN),
        z(1),
    ]));
}

function drawScore() {
    const digits = Math.floor(score)
        .toString()
        .padStart(SCORE_DIGITS, "0")
        .slice(-SCORE_DIGITS);
    scoreDigits.forEach((digit, i) => {
        digit.frame = Number(digits[i]);
    });
}

function spawnCloud() {
    add([
        sprite("cloud"),
        pos(width(), rand(CLOUD_MIN_Y, CLOUD_MAX_Y)),
        move(LEFT, CLOUD_SPEED),
        offscreen({ destroy: true }),
        "cloud",
    ]);
    cloudTimer = wait(rand(CLOUD_MIN_DELAY, CLOUD_MAX_DELAY), spawnCloud);
}
spawnCloud();

function spawnCactus() {
    add([
        sprite(choose(CACTUS_SPRITES)),
        anchor("botleft"),
        pos(width(), FLOOR_Y),
        area(),
        move(LEFT, SPEED),
        offscreen({ destroy: true }),
        "cactus",
    ]);
    cactusTimer = wait(rand(CACTUS_MIN_DELAY, CACTUS_MAX_DELAY), spawnCactus);
}
spawnCactus();

function endGame() {
    if (gameOver) return;
    gameOver = true;
    cloudTimer.cancel();
    cactusTimer.cancel();
    dino.play("dead");
    get("cactus").forEach((c) => c.unuse("move"));
    get("cloud").forEach((c) => c.unuse("move"));
    add([
        sprite("game-over"),
        anchor("center"),
        pos(width() / 2, height() / 2 - GAMEOVER_GAP),
        "gameover-ui",
    ]);
    add([
        sprite("restart"),
        anchor("center"),
        pos(width() / 2, height() / 2 + GAMEOVER_GAP),
        "gameover-ui",
    ]);
}

function restart() {
    destroyAll("cactus");
    destroyAll("cloud");
    destroyAll("gameover-ui");
    dino.pos = vec2(DINO_X, FLOOR_Y);
    dino.vel = vec2(0, 0);
    dino.play("run");
    gameOver = false;
    score = 0;
    drawScore();
    spawnCloud();
    spawnCactus();
}

onUpdate(() => {
    if (gameOver) return;
    score += dt() * SCORE_RATE;
    drawScore();
    bg1.move(-SPEED, 0);
    bg2.move(-SPEED, 0);
    if (bg1.pos.x <= -GROUND_WIDTH) bg1.pos.x = GROUND_WIDTH;
    if (bg2.pos.x <= -GROUND_WIDTH) bg2.pos.x = GROUND_WIDTH;
});
