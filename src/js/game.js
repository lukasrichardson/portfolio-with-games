import Phaser from 'phaser';
import gameConstants from './constants/game.constants.js';

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

// var game = new Phaser.Game(config);
var platforms;
// var player;
var playerEnemyCollider;
var cursors;
var stars;
var score = 0;
var scoreText;
var bombs;
var bullets;
var health = 100;
var healthText;
var immune = false;

function preload() {
    this.load.image('sky', 'sky.png');
    this.load.image('ground', 'platform.png');
    this.load.image('star', 'star.png');
    this.load.image('bomb', 'bomb.png');
    this.load.image("bullet", "bullet.png");
    this.load.spritesheet('dude', 'dude.png', {
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
    
    /*ADD CONTROLS*/
    cursors = this.input.keyboard.createCursorKeys();

    /*ADD STARS*/
    // stars = this.physics.add.group({
    //     key: 'star',
    //     repeat: 11,
    //     setXY: {
    //         x: 12,
    //         y: 0,
    //         stepX: 70
    //     }
    // });
    // stars.children.iterate((child) => {
    //     child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    // });
    // this.physics.add.collider(stars, platforms);

    /*ADD SCORE AND HEALTH TEXT*/
    scoreText = this.add.text(16, 16, 'score: 0', {
        fontSize: '32px',
        fill: '#000'
    });

    healthText = this.add.text(16, 66, `health: ${health}`, {
        fontSize: '32px',
        fill: '#000'
    });

    /*ADD BOMBS*/
    // bombs = this.physics.add.group();
    // this.physics.add.collider(bombs, platforms);
    // this.physics.add.collider(bombs, bombs);
    // spawnBomb();

    
    /* ADD BULLETS */
    bullets = this.physics.add.group();
    // this.physics.add.collider(bullets, bombs, shootBomb, null, this);
    // this.physics.add.collider(bullets, enemy, shootEnemy, null, this);
    this.physics.add.collider(bullets, platforms);
    this.physics.add.collider(bullets, bullets);

    // ADD SOCKET LOGIC
    this.socket = io();
    this.otherPlayers = this.physics.add.group();
    // dont need to assign this to a variable because of the arrow function
    this.socket.on('currentPlayers', players => {
        Object.keys(players).forEach(id => {
            if (players[id].playerId === this.socket.id) {
                /*ADD PLAYER*/
                addPlayer(this, players[id])

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
                    frames: [{ key: 'dude', frame: 4 }],
                    frameRate: 20
                });
                this.anims.create({
                    key: 'right',
                    frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
                    frameRate: 10,
                    repeat: -1
                });

                /* ADD PLAYER COLLISIONS */
                // playerEnemyCollider = this.physics.add.collider(enemy, player, hitByEnemy, null, this);
                // this.physics.add.overlap(this.player, stars, collectStar, null, this);
                // this.physics.add.collider(this.player, bombs, hitByBomb, null, this);
                
                // ADD PLAYER INPUT HANDLERS
                this.input.on('pointerdown', (pointer) => onShoot(pointer, this), this);
            } else {
                addOtherPlayers(this, players[id]);
            }
        })
    });

    this.socket.on('newPlayer', playerInfo => {
        addOtherPlayers(this, playerInfo);
    });

    this.socket.on('playerMoved', playerInfo => {
        this.otherPlayers.getChildren().forEach( otherPlayer => {
            if (playerInfo.playerId === otherPlayer.playerId) {
                otherPlayer.setRotation(playerInfo.rotation);
                otherPlayer.setPosition(playerInfo.x, playerInfo.y);
            }
        })
    });

    this.socket.on('bulletShot', serverBullet => {
        bulletShot(serverBullet, bullets);
    });

    this.socket.on('playerHit', ({ player, bullet: serverBullet}) => {
        playerTakesDamage(player, this);
        if (serverBullet.playerId === this.socket.id) {
            score += 10;
            scoreText.setText('score: ' + score);
        }
        if (player.playerId !== this.socket.id) {
            const playerHit = this.otherPlayers.getChildren().find( otherPlayer => player.playerId === otherPlayer.playerId);
            if (playerHit) playerHit.setTint(0xff0000);
        } else this.player.setTint(0xff0000);
        bullets.getChildren().forEach( bullet => {
            if (bullet.playerId == serverBullet.playerId) bullet.destroy();
        })
    })

    this.socket.on('disconnect', playerId => {
        this.otherPlayers.getChildren().forEach( otherPlayer => {
            if (playerId === otherPlayer.playerId) otherPlayer.destroy();
        })
    })
}

function update() {
    if (this.game.shouldDestroy === true) {
        this.game.destroy();
        this.socket.disconnect();
    }
    if (this.player) {
        /* CHECK IF DEAD */
        if (health <= 0) {
            this.player.setTint(0xff0000);
            setTimeout(() => {
                window.location.reload();
                alert('you die');
            }, 0);
        }
        /*PLAYER MOVE*/
        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            // this.scene.pause();
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);
            this.player.anims.play('turn');
        }
        
        /*PLAYER JUMP*/
        if (cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-330);
        }
        
        /*PLAYER FAST FALL*/
        if (cursors.down.isDown && !this.player.body.touching.down) {
            this.player.setVelocityY(330);
        }

        this.physics.world.wrap(this.player, 5);
        // emit player movement
        if (this.player.oldPosition && (this.player.x !== this.player.oldPosition.x || this.player.y !== this.player.oldPosition.y || this.player.rotation !== this.player.oldPosition.rotation)) {
            this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation });
        }

        this.player.oldPosition = {
            x: this.player.x,
            y: this.player.y,
            rotation: this.player.rotation
          };
    }
    /* ENEMY MOVE AND JUMP */
    // const xDiff = player.x - enemy.x;
    // const yDiff = player.y - enemy.y;
    // const breathingRoom = 40;
    // const closeEnough = Math.abs(xDiff) < breathingRoom && Math.abs(yDiff) < breathingRoom;
    // const enemyLeft = xDiff < 0;
    // const enemyBelow = player.y - enemy.y < 0;
    // const enemyResponseTime = Phaser.Math.Between(100, 500);
    // if (closeEnough) {
        //     enemy.setVelocityX(0);
        // } else setTimeout(() => {
            //     if (closeEnough) {
                //         enemy.setVelocityX(0);
                //     } else if (enemyLeft) {
                    //         enemy.setVelocityX(-130);
                    //         // player.anims.play('left', true);
                    //     } else enemy.setVelocityX(130);
                    //     if (enemyBelow && enemy.body.touching.down) {
                        //         enemy.setVelocityY(-330);
                        //     }
                        // }, enemyResponseTime);
}

function addPlayer(self, playerInfo) {
    self.player = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
    // player.setCollideWorldBounds(true);
    self.physics.add.collider(self.player, platforms);
    self.physics.add.collider(self.player, bullets, (player, bullet) => playerShot(player, bullet, self), null, self);
}

function addOtherPlayers(self, playerInfo) {
    // ADD ENEMY
    const enemy = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
    enemy.setCollideWorldBounds(true);
    enemy.playerId = playerInfo.playerId;
    self.physics.add.collider(enemy, platforms);
    self.otherPlayers.add(enemy);
}

function bulletShot(serverBullet, bullets) {
    const { x, y, xVel, yVel, playerId } = serverBullet;
    const newBullet = bullets.create(x, y, 'bullet');
    if (newBullet) {
        newBullet.setBounce(1);
        newBullet.setActive(true);
        newBullet.setVisible(true);
        newBullet.setScale(0.01);
        newBullet.body.velocity.y = yVel;
        newBullet.body.velocity.x = xVel;
        newBullet.playerId = playerId;
        setTimeout(() => {
            newBullet.destroy();
        }, 2500);
    }
}

// function collectStar(player, star) {
//     star.disableBody(true, true);
//     score += 10;
//     scoreText.setText('score: ' + score);
//     respawnStars();
// }

// function destroyStar (player, star) {
//     star.disableBody(true, true);
//     respawnStars(player);
// }

// function respawnStars() {
//     if (stars.countActive(true) === 0) {
//         stars.children.iterate((child) => {
//             child.enableBody(true, child.x, 0, true, true);
//         });
//         spawnBomb();
//         spawnEnemy();
//     }
// }

// function spawnBomb() {
//     var x = Phaser.Math.Between(0, 800);
//     var bomb = bombs.create(x, 16, 'bomb').setScale(2);
//     bomb.setBounce(1);
//     bomb.setCollideWorldBounds(true);
//     bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
// }

// function spawnEnemy() {

// }

// function hitByBomb(player, bomb) {
//     playerTakesDamage(player);
// }

// function shootBomb(bullet, bomb) {
//     bullet.disableBody(true, true);
//     bomb.disableBody(true, true);
//     setTimeout(spawnBomb, 5000);
// }

function shootEnemy(enemy, bullet) {
    bullet.disableBody(true, true);
    enemy.disableBody(true, true);
}

function playerShot(player, bullet, self, damage = 10) {
    if (bullet.playerId !== self.socket.id) {
        if (!immune) {
            immune = true;
            self.socket.emit('hitPlayer', { bullet, id: bullet.playerId });
            health -= damage;
            healthText.setText('health: ' + health);
            self.player.setTint(0xff0000);
            if (health <= 0) {
                self.socket.emit('deadPlayer');
            } else {
                setTimeout(() => {
                    self.player.clearTint();
                    immune = false;
                }, 500);
            }
            
        }
    }
}

function onShoot(pointer, self) {
    let xVel = 4 * (pointer.x - self.player.x);
    let yVel = 4 * (pointer.y - self.player.y);
    self.socket.emit('shootBullet', { x: self.player.x, y: self.player.y, xVel, yVel });
}

function playerTakesDamage(player, self, damage = 10) {
    // other players taking damage visually
    if (player.playerId !== self.socket.id) {
        const playerHit = self.otherPlayers.getChildren().find( otherPlayer => player.playerId === otherPlayer.playerId);
        if (playerHit) {
            playerHit.setTint(0xff0000);
            setTimeout(() => {
                playerHit.clearTint();
                immune = false;
            }, 500);
        }
    };
}

function hitByEnemy(enemy, player, x, y, z) {
    playerTakesDamage();
}

const startGame = () => new Phaser.Game(config);
export default startGame;