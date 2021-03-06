
import gameConstants from '../../constants/game2.constants';
import updateHelperFunctions from './updateHelperFunctions';
import { addControls, createMapLayers, addPlayer, addPlayerAnims, spawnEnemies, addChangeStatsListener, updateHudCooldown } from './createHelperFunctions';
//@ts-ignore
const socket = io();
const { checkPlayerStats } = updateHelperFunctions;

const { SCENES, defaultPlayerStats } = gameConstants;
let gameState: any;

class MainScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | any;
    w_key: Phaser.Input.Keyboard.Key | any;
    a_key: Phaser.Input.Keyboard.Key | any;
    s_key: Phaser.Input.Keyboard.Key | any;
    d_key: Phaser.Input.Keyboard.Key | any;
    player: Phaser.Physics.Arcade.Sprite | any;
    interact: object | any
    e_key: Phaser.Input.Keyboard.Key | any;
    map: Phaser.Tilemaps.Tilemap | any;
    worldLayer: any;
    spawnPoint: any;
    redSpawn: any;
    blueSpawn: any;
    container: Phaser.GameObjects.Container | any;
    spawns: Phaser.Physics.Arcade.Group | any;
    timedEvent: Phaser.Time.TimerEvent | any;
    hitBox: Phaser.Physics.Arcade.Sprite | any;
    shift: any;
    isExtraAttacking: string | any;
    isAutoAttacking: string | any;
    cooldown1: any;
    redEnemy: any;
    blueEnemy: any;
    cooldownAuto: any;
    redEnemyBar: Phaser.GameObjects.Graphics | any;
    redEnemyContainer: Phaser.GameObjects.Container | any;
    blueEnemyBar: Phaser.GameObjects.Graphics | any;
    hitBy: any
    lastDirection: any
    playerStats: {
        health: number;
        totalHealth: number;
        attackSpeed: number;
    } | any;
    displayStatsMenu: boolean;
    i_key: any;
    socket: any;
    constructor() {
        super({
            key: SCENES.GAME
        });
        this.interact = {
            text: 'yooooo'
        };
        this.displayStatsMenu = false;
    }

    init(data: any) {
    }
    
    preload() {

    }
    
    create() {
        this.socket = socket;
        this.socket.on('joined', (roomNumber: any) => {
            this.socket.roomNumber = roomNumber;
            addControls(this);
            createMapLayers(this);
            addPlayerAnims(this);
            addPlayer(this);
            spawnEnemies(this);
            this.addDebugGraphics();
            addChangeStatsListener(this);
        });
        this.socket.on('game-state', (data: any) => {
            let gameData = JSON.parse(data);
            if (gameState !== gameData) {
                gameState = gameData;
            }
        });
        this.socket.emit('joinRoom', {
            username: 'lukas-test',
            roomNumber: 0
        });
        // this.input.on('pointerdown', (a, b) => {
        //     console.log('pointer down', a, b);
        // })
    }

    update(time: any, delta: any) {
        // get animation key of current gamelpay frame
        
        //@ts-ignore
        if (this.game.shouldDestroy === true) {
            this.game.destroy(false);
        }
        
        //only apply updates once player container and hitbox exists
        if (this.container && this.hitBox && this.player) {
            this.updatePlayers();
            const { key: currentAnimKey } = this.player.anims.currentAnim;
            let speed = this.playerStats.speed.current; //default speed
            const prevVelocity = this.container.body.velocity.clone();
            // this.container.body.setVelocity(0);
            let isMoving = false;
            let isAttacking = false;
            let animToPlay = null;
            let yVel = 0;
            let xVel = 0;
            
            /*PLAYER MOVE HORIZONTAL*/
            if (this.a_key.isDown) {
                isMoving = true;
                // this.container.body.setVelocityX(-100);
                xVel = -100;
            } else if (this.d_key.isDown) {
                isMoving = true;
                // this.container.body.setVelocityX(100);
                xVel = 100;
            }
            
            /*PLAYER MOVE VERTICAL*/
            if (this.w_key.isDown) {
                isMoving = true;
                // this.container.body.setVelocityY(-100);
                yVel = -100;
            } else if (this.s_key.isDown) {
                isMoving = true;
                // this.container.body.setVelocityY(100);
                yVel = 100;
            } else {
            }
            let up = this.w_key.isDown && !this.s_key.isDown && !this.a_key.isDown && !this.d_key.isDown;
            let down = !this.w_key.isDown && this.s_key.isDown && !this.a_key.isDown && !this.d_key.isDown;
            let left = !this.w_key.isDown && !this.s_key.isDown && this.a_key.isDown && !this.d_key.isDown;
            let right = !this.w_key.isDown && !this.s_key.isDown && !this.a_key.isDown && this.d_key.isDown;
            if ((this.lastDirection === 'up' && this.w_key.isDown) || up) {
                animToPlay = 'walk-up';
            } else if ((this.lastDirection === 'down' && this.s_key.isDown) || down) {
                animToPlay = 'walk-down';
            } else if ((this.lastDirection === 'left' && this.a_key.isDown) || left) {
                animToPlay = 'walk-left';
            } else if ((this.lastDirection === 'right' && this.d_key.isDown) || right) {
                animToPlay = 'walk-right';
            }

            // check if left mouse button is clicked
            if (!this.isExtraAttacking && this.input.activePointer.isDown && !this.displayStatsMenu) {
                if (this.container.x > this.input.activePointer.worldX) {
                    if (this.isAutoAttacking !== 'right') this.isAutoAttacking = 'left';
                } else {
                    if (this.isAutoAttacking !== 'left') this.isAutoAttacking = 'right';
                }
            } else {
                
            }

            if (this.isAutoAttacking) {
                if (this.cooldownAuto) {
                    const { delay, elapsed } = this.cooldownAuto;
                    if (delay > elapsed) {
                        this.isAutoAttacking = false;
                    }
                }
                
                if (this.isAutoAttacking === 'left') {
                    animToPlay = 'auto-attack-left';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = -35;
                    this.hitBox.y = -10;
                    speed *= 0.7;
                    isAttacking = true;
                } else if (this.isAutoAttacking === 'right') {
                    animToPlay = 'auto-attack-right';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = 35;
                    this.hitBox.y = -10;
                    speed *=0.7;
                    isAttacking = true;
                }
                if (this.player.anims.currentFrame.textureFrame.includes('auto-attack') && this.player.anims.currentFrame.isLast) {
                    isAttacking = false;
                    this.isAutoAttacking = false;
                    animToPlay = null;
                    this.cooldownAuto = this.time.delayedCall(this.playerStats.attackSpeed.current, () => console.log('auto attack cooldown is up'), undefined, this);
                }
            } else {
                
            }

            if (!isAttacking) {
                this.hitBox.setSize(36, 49);
                this.hitBox.x = 0;
                this.hitBox.y = 0;
            }

            if (!isMoving && !isAttacking) {
                if (prevVelocity.x < 0 || currentAnimKey.includes('left')) {
                    animToPlay = 'idle-left';
                }
                else {
                    animToPlay = 'idle-right';
                }
            }
            if (animToPlay) {
                this.player.anims.play(animToPlay, true);
            }
            // Normalize and scale the velocity so that player can't move faster along a diagonal
            // this.container.body.velocity.normalize().scale(speed);
            // move enemy healthbars with enemies
            this.redEnemyBar.x = this.redEnemy.x - 10;
            this.redEnemyBar.y = this.redEnemy.y - 20;
            this.blueEnemyBar.x = this.blueEnemy.x - 10;
            this.blueEnemyBar.y = this.blueEnemy.y - 20;
            checkPlayerStats(this);
            this.emitMyInput(xVel, yVel);
        }
    }

    updatePlayers = () => {
        if (!gameState) return;
        for (let id of Object.keys(gameState.players)) {
            let player = gameState.players[id];
            if (id === this.socket.id) {
                // if (this.container.x !== player.x || this.container.y !== player.y) {
                    if (this.container.xVel !== player.xVel || this.container.yVel !== player.yVel) {
                    let speed = this.playerStats.speed.current; //default speed
                    // this.container.x = player.x;
                    // this.container.y = player.y;
                    this.container.body.setVelocityX(player.xVel);
                    this.container.body.setVelocityY(player.yVel);
                    this.container.body.velocity.normalize().scale(speed);
                }
            } else {

            }
        }
    }

    emitMyInput = (xVel: any, yVel: any) => {
        this.socket.emit('pos', {
            xVel,
            yVel
        });
    }

    /* DEBUG HELPER FUNCTIONS */
    addDebugGraphics = () => {
        // Add Debug graphics
        this.input.keyboard.once("keydown_K", (event: any) => {
            // Turn on physics debugging to show player's hitbox
            this.physics.world.createDebugGraphic();

            // Create worldLayer collision graphic above the player
            const graphics = this.add
            .graphics()
            .setAlpha(0.75)
            .setDepth(20);
            this.worldLayer.renderDebug(graphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
            });
        });
    }
    
}

export default MainScene;