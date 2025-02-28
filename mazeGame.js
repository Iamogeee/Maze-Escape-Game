const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
    physics: { default: 'arcade' },
    scene: { preload, create, update }
};

const game = new Phaser.Game(config);
let player, cursors, exit;

function preload() {
    this.load.image('wall', 'assets/wall.png');
    this.load.image('floor', 'assets/floor.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('exit', 'assets/exit.png');
}

function create() {
    let mazeData = [
        [1,1,1,1,1,1,1,1],
        [1,0,0,0,1,0,0,1],
        [1,0,1,0,1,0,1,1],
        [1,0,1,0,0,0,0,1],
        [1,0,1,1,1,1,0,1],
        [1,0,0,0,0,0,2,1],
        [1,1,1,1,1,1,1,1]
    ];

    let tileSize = 50;
    this.maze = this.add.group();

    for (let row = 0; row < mazeData.length; row++) {
        for (let col = 0; col < mazeData[row].length; col++) {
            let x = col * tileSize;
            let y = row * tileSize;

            if (mazeData[row][col] === 1) {
                this.add.image(x, y, 'wall').setOrigin(0);
            } else {
                this.add.image(x, y, 'floor').setOrigin(0);
            }

            if (mazeData[row][col] === 2) {
                exit = this.physics.add.staticSprite(x + tileSize / 2, y + tileSize / 2, 'exit');
            }
        }
    }

    player = this.physics.add.sprite(50, 50, 'player');
    player.setCollideWorldBounds(true);
    
    cursors = this.input.keyboard.createCursorKeys();
    this.physics.add.overlap(player, exit, winGame, null, this);
}

function update() {
    player.setVelocity(0);

    if (cursors.left.isDown) player.setVelocityX(-200);
    if (cursors.right.isDown) player.setVelocityX(200);
    if (cursors.up.isDown) player.setVelocityY(-200);
    if (cursors.down.isDown) player.setVelocityY(200);
}

function winGame() {
    alert("You escaped the maze!");
    location.reload();
}
