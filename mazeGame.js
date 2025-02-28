const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);

let player, cursors, exit, timerText, timer = 0;
let enemies = [];
let powerUps = [];
let gameOver = false;
let tileSize = 50;

// Maze dimensions
let rows = 10;
let cols = 12;
let maze = [];

// Preload assets
function preload() {
    this.load.image('wall', 'assets/wall.png');
    this.load.image('floor', 'assets/floor.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('exit', 'assets/exit.png');
    this.load.image('enemy', 'assets/enemy.png');
    this.load.image('speed', 'assets/speed.png');
    this.load.image('invincible', 'assets/invincible.png');
    this.load.image('teleport', 'assets/teleport.png');

    this.load.audio('move', 'assets/move.wav');
    this.load.audio('powerUp', 'assets/powerup.wav');
    this.load.audio('enemyAlert', 'assets/enemy_alert.wav');
}

// Generate a new maze using Prim’s Algorithm
function generateMaze(rows, cols) {
    let newMaze = Array(rows).fill().map(() => Array(cols).fill(1));

    function carve(x, y) {
        newMaze[y][x] = 0;
        let directions = [[0, -2], [0, 2], [-2, 0], [2, 0]];
        Phaser.Utils.Array.Shuffle(directions).forEach(([dx, dy]) => {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1 && newMaze[ny][nx] === 1) {
                newMaze[ny - dy / 2][nx - dx / 2] = 0;
                carve(nx, ny);
            }
        });
    }

    carve(1, 1);
    newMaze[1][1] = 0;  // Player Start
    newMaze[rows - 2][cols - 2] = 2;  // Exit
    return newMaze;
}

// Create game scene
function create() {
    maze = generateMaze(rows, cols);
    this.cameras.main.setBackgroundColor('#1e1e1e');

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            let x = col * tileSize;
            let y = row * tileSize;
            if (maze[row][col] === 1) {
                this.add.image(x, y, 'wall').setOrigin(0).setDisplaySize(tileSize, tileSize);
            } else {
                this.add.image(x, y, 'floor').setOrigin(0).setDisplaySize(tileSize, tileSize);
            }

            if (maze[row][col] === 2) {
                exit = this.physics.add.staticSprite(x + tileSize / 2, y + tileSize / 2, 'exit');
                exit.setDepth(2);
            }
        }
    }

    player = this.physics.add.sprite(50, 50, 'player').setCollideWorldBounds(true).setDisplaySize(tileSize * 0.8, tileSize * 0.8);
    player.setDepth(3);
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(player, exit, winGame, null, this);

    // Add Enemies
    for (let i = 0; i < 2; i++) {
        let enemy = this.physics.add.sprite(Phaser.Math.Between(100, 500), Phaser.Math.Between(100, 300), 'enemy');
        enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-100, 100));
        enemy.setBounce(1);
        enemies.push(enemy);
        this.physics.add.collider(player, enemy, gameOverFunc, null, this);
    }

    // Add Power-Ups
    addPowerUp(this, 'speed');
    addPowerUp(this, 'invincible');
    addPowerUp(this, 'teleport');

    // Add Timer UI
    timerText = this.add.text(10, 10, 'Time: 0s', { fontSize: '16px', fill: '#FFF' });
    this.time.addEvent({ delay: 1000, callback: () => { if (!gameOver) timer++; timerText.setText(`Time: ${timer}s`); }, loop: true });

    // Mobile Touch Controls
    this.input.on('pointerdown', (pointer) => {
        if (pointer.x < game.config.width / 2) player.setVelocityX(-200);
        else player.setVelocityX(200);
    });
}

// Update function: Player Movement & Enemy AI
function update() {
    if (gameOver) return;

    player.setVelocity(0);
    if (cursors.left.isDown) player.setVelocityX(-200);
    if (cursors.right.isDown) player.setVelocityX(200);
    if (cursors.up.isDown) player.setVelocityY(-200);
    if (cursors.down.isDown) player.setVelocityY(200);

    enemies.forEach(enemy => {
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y) < 150) {
            this.physics.moveToObject(enemy, player, 100);
        }
    });
}

// Power-Up Function
function addPowerUp(scene, type) {
    let powerUp = scene.physics.add.sprite(Phaser.Math.Between(100, 500), Phaser.Math.Between(100, 300), type);
    scene.physics.add.overlap(player, powerUp, () => collectPowerUp(scene, type, powerUp), null, scene);
}

// Power-Up Effects
function collectPowerUp(scene, type, powerUp) {
    powerUp.destroy();
    scene.sound.play('powerUp');

    if (type === 'speed') {
        player.setVelocityX(player.body.velocity.x * 2);
        player.setVelocityY(player.body.velocity.y * 2);
        setTimeout(() => {
            player.setVelocityX(player.body.velocity.x / 2);
            player.setVelocityY(player.body.velocity.y / 2);
        }, 5000);
    }

    if (type === 'invincible') {
        enemies.forEach(enemy => enemy.setAlpha(0.5));
        setTimeout(() => enemies.forEach(enemy => enemy.setAlpha(1)), 5000);
    }

    if (type === 'teleport') {
        player.setX(Phaser.Math.Between(50, 550));
        player.setY(Phaser.Math.Between(50, 350));
    }
}

// Win Condition
function winGame() {
    alert(`You escaped the maze in ${timer} seconds!`);
    location.reload();
}

// Game Over Condition
function gameOverFunc() {
    alert("You were caught by an enemy! Try again.");
    location.reload();
}
