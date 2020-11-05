import Phaser from 'phaser';
import gameConstants from '../constants/game.constants.js';

const { width, height, gravity, dudeWidth, dudeHeight } = gameConstants;

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width,
    height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var platforms;
var player;
var playerEnemyCollider;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var bullets;
var enemy;
var health = 100;
var healthText;
var immune = false;

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet('dude', 'assets/dude.png', {
        frameWidth: dudeWidth,
        frameHeight: dudeHeight
    });
}

function create() {

    /*ADD SKY*/
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
    /*Same Thing
    // this.add.image(center.x, center.y, 'sky');
    */

    /*ADD PLATFORMS*/
   platforms = this.physics.add.staticGroup();
   platforms.create(400, 568, 'ground').setScale(2).refreshBody();
   platforms.create(600, 400, 'ground');
   platforms.create(50, 250, 'ground');
   platforms.create(750, 220, 'ground');

   /*ADD PLAYER*/
   player = this.physics.add.sprite(100, 450, 'dude').setScale(0.5);
//    player.setBounce(0.5);
   player.setCollideWorldBounds(true);
   this.physics.add.collider(player, platforms);

   /*ADD PLAYER ANIMATIONS*/
   this.anims.create({
       key: 'left',
       frames: this.anims.generateFrameNumbers('dude', {
           start: 0,
           end: 3
       }),
       frameRate: 10,
       repeat: -1
   });
   this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    /* ADD ENEMIES */
    enemy = this.physics.add.sprite(400, 50, 'dude');
    enemy.setCollideWorldBounds(true);
    this.physics.add.collider(enemy, platforms);
    playerEnemyCollider = this.physics.add.collider(enemy, player, hitByEnemy, null, this);
    
    /*ADD CONTROLS*/
    cursors = this.input.keyboard.createCursorKeys();

    /*ADD STARS*/
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: {
            x: 12,
            y: 0,
            stepX: 70
        }
    });
    stars.children.iterate( (child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });
    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    /*ADD SCORE*/
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px',
        fill: '#000'
    });

    healthText = this.add.text(16, 66, `health: ${health}`, {
        fontSize: '32px',
        fill: '#000'
    });

    /*  */

    /*ADD BOMBS*/
    bombs = this.physics.add.group();
    this.physics.add.collider(bombs, platforms);
    this.physics.add.collider(bombs, bombs);
    // this.physics.add.overlap(bombs, stars, destroyStar, null, this);
    this.physics.add.collider(player, bombs, hitByBomb, null, this);
    spawnBomb();
    
    /* ADD BULLETS */
    bullets = this.physics.add.group();
    this.input.on('pointerdown', onShoot, this);
    this.physics.add.collider(bullets, bombs, shootBomb, null, this);
    this.physics.add.collider(bullets, enemy, shootEnemy, null, this);
    this.physics.add.collider(bullets, platforms);
    this.physics.add.collider(bullets, bullets);
}

function update() {
    /*PLAYER MOVE*/
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    /*PLAYER JUMP*/
    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
    }

    /*PLAYER FAST FALL*/
    if (cursors.down.isDown && !player.body.touching.down) {
        player.setVelocityY(330);
    }

    /* ENEMY MOVE AND JUMP */
    const xDiff = player.x - enemy.x;
    const yDiff = player.y - enemy.y;
    const breathingRoom = 40;
    const closeEnough = Math.abs(xDiff) < breathingRoom && Math.abs(yDiff) < breathingRoom;
    const enemyLeft = xDiff < 0;
    const enemyBelow = player.y - enemy.y < 0;
    const enemyResponseTime = Phaser.Math.Between(100,500);
    if (closeEnough) {
        enemy.setVelocityX(0);
    } else setTimeout(() => {
        if (closeEnough) {
            enemy.setVelocityX(0);
        } else if (enemyLeft) {
            enemy.setVelocityX(-130);
            // player.anims.play('left', true);
        } else enemy.setVelocityX(130);
        if (enemyBelow && enemy.body.touching.down) {
            enemy.setVelocityY(-330);
        }
    }, enemyResponseTime);
}

function collectStar (player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('score: ' + score);
    respawnStars();
}

// function destroyStar (player, star) {
//     star.disableBody(true, true);
//     respawnStars(player);
// }

function respawnStars () {
    if (stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true);
        });
        spawnBomb();
    }
}

function spawnBomb () {
    var x = player.x < 400 ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb').setScale(2);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200,200), 20);
}

function hitByBomb () {
    // this.physics.pause();
    playerTakesDamage();
}

function shootBomb (bullet, bomb) {
    bullet.disableBody(true, true);
    bomb.disableBody(true, true);
    setTimeout(spawnBomb, 5000);
}

function shootEnemy (enemy, bullet) {
    bullet.disableBody(true, true);
    enemy.disableBody(true, true);
}

function onShoot (pointer) {
    var bullet = bullets.create(player.x, player.y, 'bullet');
    if (bullet) {
        bullet.setBounce(1);
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setScale(0.01);
        let xVel = 4 * (pointer.x - player.x);
        let yVel = 4 * (pointer.y - player.y);
        bullet.body.velocity.y = yVel;
        bullet.body.velocity.x = xVel;
    }
}

function playerTakesDamage (damage = 10) {
    if (immune) return;
    immune = true;
    health -= damage;
    healthText.setText('health: ' + health);
    player.setTint(0xff0000);
    playerEnemyCollider.setActive = false;
    // this.physics.world.removeCollider
    if (health <= 0) {
        player.setTint(0xff0000);
        window.location.reload();
        alert('you die');
    }
    setTimeout(() => {
        player.clearTint();
        immune = false;
        playerEnemyCollider.setActive = true;
    }, 500);
}

function hitByEnemy (enemy, player, x, y, z) {
    console.log('hit by enemy', enemy, player, x, y, z);
    playerTakesDamage();
}