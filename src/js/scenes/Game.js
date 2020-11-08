
import Phaser from 'phaser';
import gameConstants from '../constants/game.constants';

const { dudeWidth, dudeHeight, SCENES } = gameConstants;

class MainScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENES.GAME
        });
        this.platforms;
        this.cursors;
        this.score = 0;
        this.scoreText;
        this.bullets;
        this.health = 100;
        this.healthText;
        this.immune = false;
        this.fireRate = 300;
        this.canShoot = true;
        this.bulletExpirationTime = 3500;
    }

    preload() {
        
    }

    create() {
        /*ADD SKY*/
        this.add.image(0, 0, 'sky').setOrigin(0, 0);
    
        /*ADD PLATFORMS*/
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        
        /*ADD CONTROLS*/
        this.cursors = this.input.keyboard.createCursorKeys();
    
        /*ADD SCORE AND HEALTH TEXT*/
        this.scoreText = this.add.text(16, 16, 'score: 0', {
            fontSize: '32px',
            fill: '#000'
        });
    
        this.healthText = this.add.text(16, 66, `health: ${this.health}`, {
            fontSize: '32px',
            fill: '#000'
        });
    
        
        /* ADD BULLETS */
        this.bullets = this.physics.add.group();
        this.physics.add.collider(this.bullets, this.platforms);
        this.physics.add.collider(this.bullets, this.bullets);
    
        this.otherPlayers = this.physics.add.group();
        
        // ADD SOCKET LOGIC
        this.socket = io();
        this.socket.emit('joinRoom');
        // dont need to assign `this` to a variable because of the arrow function
        this.socket.on('currentPlayers', players => {
            Object.keys(players).forEach(id => {
                if (players[id].playerId === this.socket.id) {
                    /*ADD PLAYER*/
                    this.addPlayer(players[id])
    
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
                    
                    // ADD PLAYER INPUT HANDLERS
                    this.input.on('pointerdown', (pointer) => this.onShoot(pointer), this);
                } else {
                    this.addOtherPlayers(players[id]);
                }
            })
        });
    
        this.socket.on('newPlayer', playerInfo => {
            this.addOtherPlayers(playerInfo);
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
            this.bulletShot(serverBullet);
        });
    
        this.socket.on('playerHit', ({ player, bullet: serverBullet}) => {
            this.playerTakesDamage(player);
            if (serverBullet.playerId === this.socket.id) {
                this.score += 10;
                this.scoreText.setText('score: ' + this.score);
            }
            if (player.playerId !== this.socket.id) {
                const playerHit = this.otherPlayers.getChildren().find( otherPlayer => player.playerId === otherPlayer.playerId);
                if (playerHit) playerHit.setTint(0xff0000);
            } else this.player.setTint(0xff0000);
            this.bullets.getChildren().forEach( bullet => {
                if (bullet.playerId == serverBullet.playerId) bullet.destroy();
            })
        })
    
        this.socket.on('disconnect', playerId => {
            this.otherPlayers.getChildren().forEach( otherPlayer => {
                if (playerId === otherPlayer.playerId) otherPlayer.destroy();
            })
        })
    }

    update() {
        if (this.game.shouldDestroy === true) {
            this.game.destroy();
            this.socket.disconnect();
        }
        if (this.player) {
            /* CHECK IF DEAD */
            if (this.health <= 0) {
                this.player.setTint(0xff0000);
                setTimeout(() => {
                    window.location.reload();
                    alert('you die');
                }, 0);
            }
            /*PLAYER MOVE*/
            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-160);
                this.player.anims.play('left', true);
            } else if (this.cursors.right.isDown) {
                // this.scene.pause();
                this.player.setVelocityX(160);
                this.player.anims.play('right', true);
            }
            else {
                this.player.setVelocityX(0);
                this.player.anims.play('turn');
            }
            
            /*PLAYER JUMP*/
            if (this.cursors.up.isDown && this.player.body.touching.down) {
                this.player.setVelocityY(-330);
            }
            
            /*PLAYER FAST FALL*/
            if (this.cursors.down.isDown && !this.player.body.touching.down) {
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
    }
    
    addPlayer = (playerInfo) => {
        this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
        // player.setCollideWorldBounds(true);
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.bullets, this.playerShot, null, this);
    }
    
    addOtherPlayers = (playerInfo) => {
        // ADD ENEMY
        const enemy = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
        enemy.playerId = playerInfo.playerId;
        this.physics.add.collider(enemy, this.platforms);
        this.otherPlayers.add(enemy);
    }
    
    bulletShot = (serverBullet) => {
        const { x, y, xVel, yVel, playerId } = serverBullet;
        const newBullet = this.bullets.create(x, y, 'bullet');
        if (newBullet) {
            newBullet.setBounce(1);
            newBullet.setActive(true);
            newBullet.setVisible(true);
            newBullet.setScale(0.02);
            newBullet.body.velocity.y = yVel;
            newBullet.body.velocity.x = xVel;
            newBullet.playerId = playerId;
            setTimeout(() => {
                newBullet.destroy();
            }, this.bulletExpirationTime);
        }
    }

    playerShot = (player, bullet, damage = 10) => {
        if (bullet.playerId !== this.socket.id) {
            if (!this.immune) {
                this.immune = true;
                this.socket.emit('hitPlayer', { bullet, id: bullet.playerId });
                this.health -= damage;
                this.healthText.setText('health: ' + this.health);
                this.player.setTint(0xff0000);
                if (this.health <= 0) {
                    this.socket.emit('deadPlayer');
                } else {
                    setTimeout(() => {
                        this.player.clearTint();
                        this.immune = false;
                    }, 500);
                }
                
            }
        }
    }
    
    onShoot = (pointer) => {
        if (this.canShoot) {
            let xVel = 4 * (pointer.x - this.player.x);
            let yVel = 4 * (pointer.y - this.player.y);
            this.socket.emit('shootBullet', { x: this.player.x, y: this.player.y, xVel, yVel });
            this.canShoot = false;
            setTimeout(() => {
               this.canShoot = true; 
            }, this.fireRate);
        }
    }
    
    playerTakesDamage = (player, damage = 10) => {
        // other players taking damage visually
        if (player.playerId !== this.socket.id) {
            const playerHit = this.otherPlayers.getChildren().find( otherPlayer => player.playerId === otherPlayer.playerId);
            if (playerHit) {
                playerHit.setTint(0xff0000);
                setTimeout(() => {
                    playerHit.clearTint();
                    this.immune = false;
                }, 500);
            }
        };
    }
}

export default MainScene;