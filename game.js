import kaplay from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";

kaplay({
    canvas: document.getElementById("game"),
    width: 1200,
    height: 300,
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

const GROUND_WIDTH = 1200;
const GROUND_Y = height() - 24;
const SPEED = 200;
setGravity(600)

const bg1 = add([
    sprite("ground"),
    pos(0, GROUND_Y),
]);
const bg2 = add([
    sprite("ground"),
    pos(GROUND_WIDTH, GROUND_Y),
]);

const dino = add([
    sprite("dino"),
    pos(50, GROUND_Y - 40),
    area(),
    body(),
])

add([
    rect(width(), 20),
    pos(0, GROUND_Y + 5),
    area(),
    body({ isStatic: true }),
    opacity(0),
]);

dino.play("run");
onClick(() => {
    if (!dino.isGrounded()) return;
    dino.jump(300);
    dino.play("jump");
});
dino.onGround(() => {
    dino.play("run");
});

onUpdate(() => {
    bg1.move(-SPEED, 0);
    bg2.move(-SPEED, 0);
    if (bg1.pos.x <= -GROUND_WIDTH) bg1.pos.x = GROUND_WIDTH;
    if (bg2.pos.x <= -GROUND_WIDTH) bg2.pos.x = GROUND_WIDTH;
});

function spawnCloud() {
    add([
        sprite("cloud"),
        pos(width(), rand(60, 110)),
        move(LEFT, 150),
        offscreen({ destroy: true }),
    ]);
    wait(rand(1.5, 4), spawnCloud);
}
spawnCloud();
