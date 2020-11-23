
// import Phaser from 'phaser';
import gameConstants from '../../constants/game2.constants';
//@ts-ignore
import eventsCenter from '../../EventsCenter.js';

const { SCENES, defaultSpeed, defaultPlayerStats } = gameConstants;

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
    playerStats: {
        health: number;
        totalHealth: number;
        attackSpeed: number;
    } | any;
    displayStatsMenu: boolean;
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
        
        this.addControls();
        this.createMapLayers();
        this.addPlayerAnims();
        this.addPlayer();
        this.spawnEnemies();
        this.addDebugGraphics();
        eventsCenter.on('changeStats', (stats: any) => {
            const { name, operation } = stats;
            console.log('changeStats:', stats);
            let value = null;
            switch (name) {
                case 'health':
                    switch (operation) {
                        case 'add':
                            this.playerStats = {
                                ...this.playerStats,
                                health: this.playerStats.health + 10,
                                totalHealth: this.playerStats.totalHealth + 10
                            }
                            break;
                        case 'subtract':
                            this.playerStats = {
                                ...this.playerStats,
                                health: this.playerStats.health - 10,
                                totalHealth: this.playerStats.totalHealth - 10
                            }
                            break;
                        default:
                            break;
                    }
                    value = this.playerStats.totalHealth;
                    eventsCenter.emit('damage', this.playerStats);
                    break;
                case 'speed':
                    switch (operation) {
                        case 'add':
                            this.playerStats = {
                                ...this.playerStats,
                                speed: this.playerStats.speed + 10
                            }
                            break;
                        case 'subtract':
                            this.playerStats = {
                                ...this.playerStats,
                                speed: this.playerStats.speed - 10
                            }
                            break;
                        default:
                            break;
                    }
                    value = this.playerStats.speed;
                    break;
                case 'attackSpeed':
                    switch (operation) {
                        case 'add':
                            this.playerStats = {
                                ...this.playerStats,
                                attackSpeed: this.playerStats.attackSpeed - 50
                            }
                            break;
                        case 'subtract':
                            this.playerStats = {
                                ...this.playerStats,
                                attackSpeed: this.playerStats.attackSpeed + 50
                            }
                            break;
                        default:
                            break;
                    }
                    if (this.playerStats.attackSpeed < 50) this.playerStats.attackSpeed = 50;
                    if (this.playerStats.attackSpeed > 750) this.playerStats.attackSpeed = 750;
                    // value = this.playerStats.attackSpeed / defaultPlayerStats.attackSpeed * 100;
                    value = (defaultPlayerStats.attackSpeed + (defaultPlayerStats.attackSpeed - this.playerStats.attackSpeed)) / defaultPlayerStats.attackSpeed * 100;
                    break;
                default:
                    break;
            }
            eventsCenter.emit('updateHudStats', { name, value });
        });
    }

    /* CREATE METHOD HELPER FUNCTIONS */
    addControls = () => {
        /*ADD CONTROLS*/
        this.input.mouse.capture = true;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.w_key = this.input.keyboard.addKey('W');
        this.a_key = this.input.keyboard.addKey('A');
        this.s_key = this.input.keyboard.addKey('S');
        this.d_key = this.input.keyboard.addKey('D');
        this.e_key = this.input.keyboard.addKey('E');
        this.e_key.on('down', () => {
            // interact menu logic
            const statsMenu = document.querySelector('.hud-ui__stats');
            if (statsMenu) {
                //@ts-ignore
                if (statsMenu.style.display === 'none') {
                    //@ts-ignore
                    statsMenu.style.display = 'flex';
                    this.displayStatsMenu = true;
                } else {
                    //@ts-ignore
                    statsMenu.style.display = 'none';
                    this.displayStatsMenu = false;
                }
            }
        });
        this.shift = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    }

    createMapLayers = () => {
        /*Load level from json */
        this.map = this.make.tilemap({ key: "map" });

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = this.map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = this.map.createDynamicLayer("Below Player", tileset, 0, 0);
        this.worldLayer = this.map.createDynamicLayer("World", tileset, 0, 0);
        const aboveLayer = this.map.createDynamicLayer("Above Player", tileset, 0, 0);
        this.worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);
        //belowLayer.putTileAt(10, 20, 10);// put tile at index 10 from tilemap at layer grid location (20, 20)
        // belowLayer.putTileAtWorldXY(2, 200, 50);// put til at index 2 from tilemap at layer pixel location (200, 50)


        // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
        // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
        this.spawnPoint = this.map.findObject("Objects", (obj: any) => obj.name === "Spawn Point");
        this.redSpawn = this.map.findObject("Objects", (obj: any) => obj.name === "Red Spawn");
        this.blueSpawn = this.map.findObject("Objects", (obj: any) => obj.name === "Blue Spawn");
    }

    addPlayerAnims = () => {
        //create player animations
        this.anims.create({
            key: 'right',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'walk',
                suffix: '.png',
                start: 1,
                end: 6
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'left',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'left-walk',
                suffix: '.png',
                start: 1,
                end: 6
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'attack-right',
            frameRate: 16,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'auto_attack',
                suffix: '.png',
                start: 0,
                end: 4
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'attack-left',
            frameRate: 16,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'auto_left-attack',
                suffix: '.png',
                start: 0,
                end: 4
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'idle-left',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'left-walk',
                suffix: '.png',
                start: 1,
                end: 1
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'idle-right',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'walk',
                suffix: '.png',
                start: 1,
                end: 1
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'attack-extra-left',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'left-attack_extra',
                suffix: '.png',
                start: 1,
                end: 8
            }),
            repeat: -1

        });
        this.anims.create({
            key: 'attack-extra-right',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'attack_extra',
                suffix: '.png',
                start: 1,
                end: 8
            }),
            repeat: -1

        });
    }

    addPlayer = () => {
        //create container for player sprites / hitboxes
        this.container = this.add.container(this.spawnPoint.x, this.spawnPoint.y);
        this.container.setSize(36, 49).setScale(0.8, 0.8);
        this.physics.world.enable(this.container);
        // add damage player has taken to scene instance data
        this.hitBy = {};
        // put player sprite inside a container that will control collisions and movement
        this.player = this.physics.add.sprite(0, 5, 'knight-walk', 'walk1.png').setScale(1, 1).setSize(36, 49).setOffset(65, 60);
        this.playerStats = {
            health: 100,
            totalHealth: 100,
            speed: defaultPlayerStats.speed,
            attackSpeed: defaultPlayerStats.attackSpeed
        }
        Object.keys(this.playerStats).forEach(key => {
            if (key === 'attackSpeed')  eventsCenter.emit('updateHudStats', { name: key, value: (defaultPlayerStats[key] + (defaultPlayerStats[key] - this.playerStats[key])) / defaultPlayerStats[key] * 100 });
            else eventsCenter.emit('updateHudStats', { name: key, value: this.playerStats[key] });
        });
    
        this.hitBox = this.physics.add.sprite(0, 5, 'hitbox').setScale(1, 1).setSize(0, 0).setVisible(false);
        this.container.add([this.player, this.hitBox]);

        // container collides with world layer
        this.physics.add.collider(this.container, this.worldLayer, this.playerWorldCollisionHandler);
        
        // start with idle animation
        this.player.anims.play('idle-left');
        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;
        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.startFollow(this.container);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        if (this.spawns) {
            this.addEnemyInteractions();
        }
        eventsCenter.emit('damage', this.playerStats);
    }

    spawnEnemies = () => {
        // create enemies group
        this.spawns = this.physics.add.group({
            classType: Phaser.GameObjects.Sprite,
            immovable: true
        });
        // create enemies
        this.redEnemy = this.spawns.create(this.redSpawn.x, this.redSpawn.y, 'redEnemy');
        this.redEnemy.healthBar = {
            current: 100,
            total: 100,
            immune: false,
            name: 'redEnemyBar'
        };
        this.redEnemyBar = this.add.graphics();
        this.redEnemyBar.fillStyle(0x2ecc71, 1);
        this.redEnemyBar.fillRect(0, 0, 20, 5);
        this.redEnemyBar.x = this.redSpawn.x;
        this.redEnemyBar.y = this.redSpawn.y;
        this.redEnemyBar.setDepth(50);

        // this.redEnemyContainer = this.add.container(this.redSpawn.x, this.redSpawn.y);
        // this.redEnemyContainer.setSize(36, 49);
        // this.redEnemyContainer.add(this.redEnemyBar);

        this.blueEnemy = this.spawns.create(this.blueSpawn.x, this.blueSpawn.y, 'redEnemy');
        this.blueEnemy.healthBar = {
            current: 100,
            total: 100,
            immune: false,
            name: 'blueEnemyBar'
        };
        this.blueEnemyBar = this.add.graphics();
        this.blueEnemyBar.fillStyle(0x2ecc71, 1);
        this.blueEnemyBar.fillRect(0, 0, 20, 5);
        this.blueEnemyBar.x = this.redSpawn.x;
        this.blueEnemyBar.y = this.redSpawn.y;
        this.blueEnemyBar.setDepth(50);

        // add collider for map and enemies
        this.physics.add.collider(this.spawns, this.worldLayer/*, this.spawnsWorldCollisionHandler*/);

        this.addEnemyInteractions();

        this.timedEvent = this.time.addEvent({
            delay: 600,
            callback: this.moveEnemies,
            callbackScope: this,
            loop: true
        })
    }

    addEnemyInteractions = () => {
        // add attack logic for player hitting enemy
        this.physics.add.overlap(this.spawns, this.hitBox, this.hitEnemy);

        // collision logic with enemy and player container
        this.physics.add.collider(this.spawns, this.container, this.collideWithEnemy);
    }

    hitEnemy = (hitBox: any, enemy: any) => {
        const { parentContainer } = hitBox;
        const { currentFrame } = parentContainer.list[0].anims;
        const { name: frameName } = currentFrame.frame;
        const { name } = enemy.healthBar;
        //@ts-ignore
        let enemyHealthBar = this[name];
        
        let damage = 0;
        if (frameName.includes('attack2') || frameName.includes('attack3') || frameName.includes('attack4')) {//auto attack
            damage += 10;
        } else if (frameName.includes('attack_extra5') || frameName.includes('attack_extra6') || frameName.includes('attack_extra7')) {//extra attack
            damage += 25;
        }
        if (damage > 0 && !enemy.healthBar.immune) {
            enemy.healthBar = {
                ...enemy.healthBar,
                current: enemy.healthBar.current - damage,
                immune: true
            };
            if (enemyHealthBar) {
                enemyHealthBar.scaleX = enemy.healthBar.current / 100;
                if (enemyHealthBar.scaleX < 0) enemyHealthBar.scaleX = 0;
            }
            enemy.setTint(0xFF0000);
            this.time.delayedCall(500, () => {
                enemy.healthBar = {
                    ...enemy.healthBar,
                    immune: false
                };
                enemy.clearTint();
            }, undefined, this);
        }
        if (enemy.healthBar.current <= 0) {
            enemy.destroy();
        }
    }

    moveEnemies = () => {
        this.spawns.getChildren().forEach((enemy: any) => {
            const randomNumber = Math.floor((Math.random() * 4) + 1);

            switch(randomNumber) {
                case 1:
                  enemy.body.setVelocityX(50);
                  break;
                case 2:
                  enemy.body.setVelocityX(-50);
                  break;
                case 3:
                  enemy.body.setVelocityY(50);
                  break;
                case 4:
                  enemy.body.setVelocityY(-50);
                  break;
                default:
                  enemy.body.setVelocityX(50);
              }
        });

        setTimeout(() => {
            this.spawns.setVelocityX(0);
            this.spawns.setVelocityY(0);
          }, 500);
    }

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
    
    playerWorldCollisionHandler = (player: any, world: any) => {
        if (world.properties.text) {
            if (!this.interact.text !== world.properties.text)
            this.interact = {
                text: world.properties.text
            };
        }
    }

    collideWithEnemy = (container: any, enemy: any) => {
        const { name } = enemy.healthBar;
        if (!this.hitBy[name]) {
            this.hitBy[name] = name;
            this.playerStats.health -= 10;
            eventsCenter.emit('damage', this.playerStats);
            this.player.setTint(0xFF0000);
            this.time.delayedCall(500, () => {
                delete this.hitBy[name];
                this.player.clearTint();
            }, undefined, this);
        } else {
        }
    }

    update(time: any, delta: any) {
        // get animation key of current gamelpay frame
        
        //@ts-ignore
        if (this.game.shouldDestroy === true) {
            this.game.destroy(false);
        }
        
        //only apply updates once player container and hitbox exists
        if (this.container && this.hitBox && this.player) {
            const { key: currentAnimKey } = this.player.anims.currentAnim;
            let speed = this.playerStats.speed; //default speed
            const prevVelocity = this.container.body.velocity.clone();
            this.container.body.setVelocity(0);
            let isMoving = false;
            let isAttacking = false;
            let animToPlay = null;
            
            /*PLAYER MOVE HORIZONTAL*/
            if (/*this.cursors.left.isDown ||*/ this.a_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityX(-100);
                animToPlay = 'left';
            } else if (/*this.cursors.right.isDown ||*/ this.d_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityX(100);
                animToPlay = 'right';
            } else {
            }
            
            /*PLAYER MOVE VERTICAL*/
            if (/*this.cursors.up.isDown ||*/ this.w_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityY(-100);
            } else if (/*this.cursors.down.isDown ||*/ this.s_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityY(100);
            } else {
            }

            if (this.container.body.velocity.x === 0 && isMoving){
                if (currentAnimKey.includes('right')) {
                    animToPlay = 'right';
                } else animToPlay = 'left';
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
                    animToPlay = 'attack-left';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = -35;
                    this.hitBox.y = -10;
                    speed *= 0.7;
                    isAttacking = true;
                } else if (this.isAutoAttacking === 'right') {
                    animToPlay = 'attack-right';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = 35;
                    this.hitBox.y = -10;
                    speed *=0.7;
                    isAttacking = true;
                }
                if (this.player.anims.currentFrame.textureFrame.includes('auto_') && this.player.anims.currentFrame.isLast) {
                    isAttacking = false;
                    this.isAutoAttacking = false;
                    animToPlay = null;
                    this.cooldownAuto = this.time.delayedCall(this.playerStats.attackSpeed, () => console.log('auto attack cooldown is up'), undefined, this);
                }
            } else {
                
            }

            //shift button input
            if (this.shift.isDown) {
                isAttacking = true;
                let movingRight = this.d_key.isDown && this.container.body.velocity.x > 0;
                let movingLeft = this.a_key.isDown && this.container.body.velocity.x < 0;
                if ((movingRight && !currentAnimKey.includes('left')) || (currentAnimKey.includes('right') && !movingLeft)) {
                    this.isExtraAttacking = 'right';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = 35;
                    this.hitBox.y = -10;
                } else if ((!movingRight && currentAnimKey.includes('left')) || (!currentAnimKey.includes('right') && movingLeft)) {
                    this.isExtraAttacking = 'left';
                    this.hitBox.setSize(46, 54);
                    this.hitBox.x = -35;
                    this.hitBox.y = -10;
                }
            }

            if (this.isExtraAttacking) {
                if (this.cooldown1) {
                    let { delay, elapsed } = this.cooldown1;
                    if (delay > elapsed) this.isExtraAttacking = false;
                }
                
                if (this.isExtraAttacking === 'left') {
                    animToPlay = 'attack-extra-left';
                    speed *= 1.5;
                    isAttacking = true;
                } else if (this.isExtraAttacking === 'right') {
                    animToPlay = 'attack-extra-right';
                    speed *= 1.5;
                    isAttacking = true;
                } else {
                }
                if (this.player.anims.currentFrame.textureFrame.includes('attack_extra') && this.player.anims.currentFrame.isLast) {
                    isAttacking = false;
                    animToPlay = null;
                    this.isExtraAttacking = false;
                    this.cooldown1 = this.time.delayedCall(defaultPlayerStats.cooldown1, () => console.log('ability 1 cooldown is up'), undefined, this);
                }
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
                if (animToPlay.includes('right')) {
                    this.player.setOffset(25, 60);
                } else {
                    this.player.setOffset(65, 60);
                }
                this.player.anims.play(animToPlay, true);
            }
            // Normalize and scale the velocity so that player can't move faster along a diagonal
            this.container.body.velocity.normalize().scale(speed);
        }
        // move enemy healthbars with enemies
        this.redEnemyBar.x = this.redEnemy.x - 10;
        this.redEnemyBar.y = this.redEnemy.y - 20;
        this.blueEnemyBar.x = this.blueEnemy.x - 10;
        this.blueEnemyBar.y = this.blueEnemy.y - 20;
        this.checkPlayerStats();
    }
    checkPlayerStats = () => {
        if (this.player) {
            if (this.playerStats.health <= 0) {
                this.respawnPlayer();
            }
        }
    }
    respawnPlayer = () => {
        this.player.anims.stop();
        this.player.destroy();
        this.player = null;
        this.hitBox.destroy();
        this.hitBox = null;
        this.container.destroy();
        this.container = null;
        this.isExtraAttacking = false;
        this.isAutoAttacking = false;
        this.addPlayer();
    }
}

export default MainScene;