
// import Phaser from 'phaser';
import gameConstants from '../constants/game.constants';
//@ts-ignore
import User from '../../../server/user';

const { SCENES } = gameConstants;

class MainScene extends Phaser.Scene {
    platforms: Phaser.Physics.Arcade.StaticGroup | any;
    cursors: any;
    score: number;
    scoreText: any;
    bullets: any;
    health: number;
    healthText: any;
    immune: boolean;
    fireRate: number;
    canShoot: boolean;
    bulletExpirationTime: number;
    otherPlayers: Phaser.Physics.Arcade.Group | any;
    socket: any;
    player: any;
    username: string | undefined;
    roomNumber: string | undefined;
    w_key: any;
    a_key: any;
    s_key: any;
    d_key: any;
    constructor() {
        super({
            key: SCENES.GAME
        });
        this.cursors;
        this.score = 0;
        this.scoreText;
        this.bullets;
        this.health = 100;
        this.healthText;
        this.immune = false;
        this.fireRate = 400;
        this.canShoot = true;
        this.bulletExpirationTime = 3500;
    }

    init(data: any) {
        const { username, roomNumber } = data;
        this.username = username;
        this.roomNumber = roomNumber;
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
        this.w_key = this.input.keyboard.addKey('W');
        this.a_key = this.input.keyboard.addKey('A');
        this.s_key = this.input.keyboard.addKey('S');
        this.d_key = this.input.keyboard.addKey('D');
    
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
    
        /* ADD OTHER PLAYERS */
        this.otherPlayers = this.physics.add.group();
        
        // ADD SOCKET LOGIC
        // IO variable comes from <script> in index.html
        //@ts-ignore
        this.socket = io();
        this.socket.emit('joinRoom', {
            username: this.username,
            roomNumber: this.roomNumber
        });
        // dont need to assign `this` to a variable because of the arrow function
        this.socket.on('currentPlayers', (players: { [id: string]: User}) => {
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
                    this.input.on('pointerdown', this.onShoot, this);
                } else {
                    this.addOtherPlayers(players[id]);
                }
            })
        });
    
        this.socket.on('newPlayer', (playerInfo: User) => {
            this.addOtherPlayers(playerInfo);
        });
    
        this.socket.on('playerMoved', (playerInfo: { new: User, old: User}) => {
            const { xVel, yVel, rotation } = playerInfo.new;
            let applyAnims = (targetPlayer: any) => {
                if (xVel > 0) {
                    targetPlayer.anims.play('right', true);
                } else if (xVel < 0) {
                    targetPlayer.anims.play('left', true);
                } else {
                    targetPlayer.anims.play('turn');
                }
            }
            if (this.socket.id == playerInfo.new.playerId) {
                this.player.setRotation(rotation);
                this.player.setVelocityX(xVel);
                this.player.setVelocityY(yVel);
                applyAnims(this.player);
            } else if (this.otherPlayers) {
                this.otherPlayers.getChildren().forEach( (otherPlayer: any) => {
                    if (playerInfo.new.playerId === otherPlayer.playerId) {
                        otherPlayer.setRotation(playerInfo.new.rotation);
                        // otherPlayer.setPosition(playerInfo.new.x, playerInfo.new.y);
                        otherPlayer.setVelocityX(xVel);
                        otherPlayer.setVelocityY(yVel);
                        applyAnims(otherPlayer);
                    }
                })
            }
        });
    
        this.socket.on('bulletShot', (serverBullet: { x: number, y: number, xVel: number, yVel: number, playerId: string }) => {
            this.bulletShot(serverBullet);
        });
        //@ts-ignore
        this.socket.on('playerHit', ({ player, bullet: serverBullet}) => {
            this.playerTakesDamage(player);
            if (serverBullet.playerId === this.socket.id) {
                this.score += 10;
                this.scoreText.setText('score: ' + this.score);
            }
            if (player.playerId !== this.socket.id) {
                const playerHit = this.otherPlayers.getChildren().find( (otherPlayer: any) => player.playerId === otherPlayer.playerId);
                if (playerHit) playerHit.setTint(0xff0000);
            } else this.player.setTint(0xff0000);
            this.bullets.getChildren().forEach( (bullet: any) => {
                if (bullet.playerId == serverBullet.playerId) bullet.destroy();
            })
        })
    
        this.socket.on('disconnect', (playerId: string) => {
            this.otherPlayers.getChildren().forEach( (otherPlayer: any) => {
                if (playerId === otherPlayer.playerId) otherPlayer.destroy();
            })
        })
    }

    update() {
        let yVel;
        let xVel;
        //@ts-ignore
        if (this.game.shouldDestroy === true) {
            this.game.destroy(false);
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
            if (this.cursors.left.isDown || this.a_key.isDown) {
                xVel = -160;
            } else if (this.cursors.right.isDown || this.d_key.isDown) {
                xVel = 160;
            }
            else {
                xVel = 0;
            }
            
            /*PLAYER JUMP*/
            if ((this.cursors.up.isDown || this.w_key.isDown) && this.player.body.touching.down) {
                yVel = -330;
            } else if ((this.cursors.down.isDown || this.s_key.isDown) && !this.player.body.touching.down) {
                /*PLAYER FAST FALL*/
                yVel = 330;
            } else yVel = this.player.body.velocity.y;
    
            this.physics.world.wrap(this.player, 5);
            this.physics.world.wrap(this.otherPlayers, 5);
            // emit player movement
            if (this.player.body.velocity.y != yVel || this.player.body.velocity.x != xVel) {
                this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation, xVel, yVel });
            }
        }
    }
    
    addPlayer = (playerInfo: User) => {
        this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
        if (this.platforms) this.physics.add.collider(this.player, this.platforms);
        //@ts-ignore
        this.physics.add.overlap(this.player, this.bullets, this.playerShot, undefined, this);
    }
    
    addOtherPlayers = (playerInfo: User) => {
        // ADD ENEMY
        const enemy = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'dude').setScale(0.5);
        enemy.setPosition(playerInfo.x, playerInfo.y);
        //@ts-ignore
        enemy.playerId = playerInfo.playerId;
        if (this.platforms) this.physics.add.collider(enemy, this.platforms);
        if (this.otherPlayers) this.otherPlayers.add(enemy);
    }
    
    bulletShot = (serverBullet: { x: number, y: number, xVel: number, yVel: number, playerId: string }) => {
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
            newBullet.setCollideWorldBounds(true);
            newBullet.body.onWorldBounds = true;
            newBullet.body.world.on('worldbounds', function(body: any) {
            // Check if the body's game object is the newBullet you are listening for
            if (body.gameObject === newBullet) {
                // Stop physics and render updates for this object
                newBullet.destroy();
            }
            }, newBullet);
        }
    }

    playerShot = (_player: any, bullet: { x: number, y: number, xVel: number, yVel: number, playerId: string }, damage = 10) => {
        if (bullet.playerId !== this.socket.id) {
            if (!this.immune) {
                let { x: xVel, y: yVel } = this.player.body.velocity;
                // this.socket.emit('playerMovement', { x: this.player.x, y: this.player.y, rotation: this.player.rotation, xVel, yVel });
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
    
    onShoot = (pointer: { x: number, y: number}) => {
        if (this.canShoot) {
            let xVel = 4 * (pointer.x - this.player.x);
            let yVel = 4 * (pointer.y - this.player.y);
            if (Math.abs(xVel) < 80 ) {
                xVel = 80 * (xVel / Math.abs(xVel));
            }
            if (Math.abs(yVel) < 80 ) {
                yVel = 80 * (yVel / Math.abs(yVel));
            }
            this.socket.emit('shootBullet', { x: this.player.x, y: this.player.y, xVel, yVel });
            this.canShoot = false;
            setTimeout(() => {
               this.canShoot = true; 
            }, this.fireRate);
        }
    }
    
    playerTakesDamage = (player: User, _damage = 10) => {
        // other players taking damage visually
        if (player.playerId !== this.socket.id && this.otherPlayers) {
            const playerHit = this.otherPlayers.getChildren().find( (otherPlayer: any) => player.playerId === otherPlayer.playerId);
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