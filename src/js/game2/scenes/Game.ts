
// import Phaser from 'phaser';
import gameConstants from '../../constants/game2.constants';

const { SCENES } = gameConstants;

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
    constructor() {
        super({
            key: SCENES.GAME
        });
        this.interact = {};
    }

    init(data: any) {
    }
    
    preload() {

    }
    
    create() {
        
        this.addControls();
        this.createMapLayers();
        this.addPlayer();
        this.spawnEnemies();
        this.addDebugGraphics();
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
            const menuElement = document.querySelector('.text-menu');
            if (menuElement){
                if (this.interact.text) {
                    const menuText = menuElement.querySelector('span');
                    //@ts-ignore
                    if (menuElement.style.display === 'none') {
                        //@ts-ignore
                        menuElement.style.display = 'block';
                        if (menuText) {
                            menuText.innerText = this.interact.text;
                        }
                    } else {
                        if (menuText) {
                            if (menuText.innerText === this.interact.text) {
                                //@ts-ignore
                                menuElement.style.display = 'none';
                            } else {
                                menuText.innerText = this.interact.text;
                            }
                        }
                    }
                    //@ts-ignore
                } else if (menuElement.style.display === 'block') {
                    //@ts-ignore
                    menuElement.style.display = 'none';
                }
            }
        });
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

    addPlayer = () => {
        // put player sprite inside a container that will control collisions and movement
        this.player = this.physics.add.sprite(0, 5, 'knight-walk', 'walk1.png').setScale(1, 1).setSize(36, 59).setOffset(65, 55);
        this.container = this.add.container(this.spawnPoint.x, this.spawnPoint.y);
        this.container.setSize(36, 49).setScale(0.8, 0.8);
        this.physics.world.enable(this.container);
        this.container.add(this.player);
        // this.container.setOffset(0, 5);
        // container collides with world layer
        this.physics.add.collider(this.container, this.worldLayer, this.playerWorldCollisionHandler);
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
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'attack',
                suffix: '.png',
                start: 0,
                end: 4
            }),
            repeat: -1
    
        });
        this.anims.create({
            key: 'attack-left',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'left-attack',
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
        // start with idle animation
        this.player.anims.play('idle-left');
        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;
        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.startFollow(this.container);
        camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    }

    spawnEnemies = () => {
        // create enemies group
        this.spawns = this.physics.add.group({
            classType: Phaser.GameObjects.Sprite,
            immovable: true
        });
        // create enemies
        this.spawns.create(this.redSpawn.x, this.redSpawn.y, 'redEnemy');
        this.spawns.create(this.blueSpawn.x, this.blueSpawn.y, 'redEnemy');
        this.physics.add.collider(this.spawns, this.worldLayer/*, this.spawnsWorldCollisionHandler*/);
        this.physics.add.collider(this.spawns, this.container, (container, enemy) => {
            if (container.list[0].anims.currentAnim === 'attacking-left' || container.list[0].anims.currentAnim === 'attacking-right') {
                console.log('atacking enemy!', enemy);
            }
            console.log('collide with enemy', this.player.anims.currentAnim, container.list[0], enemy);
        });
        // this.physics.add.overlap(this.spawns, this.container);

        this.timedEvent = this.time.addEvent({
            delay: 3000,
            callback: this.moveEnemies,
            callbackScope: this,
            loop: true
        })
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
          }, 1000);
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

    // spawnsWorldCollisionHandler = (spawn, world) => {
    // }

    update(time: any, delta: any) {
        //@ts-ignore
        if (this.game.shouldDestroy === true) {
            this.game.destroy(false);
        }
        //only apply updates once player container exists
        if (this.container) {
            const speed = 175;
            const prevVelocity = this.container.body.velocity.clone();
            this.container.body.setVelocity(0);
            let isMoving = false;
            let isAttacking = false;
            let animToPlay = null;
            const { key: currentAnimKey } = this.player.anims.currentAnim;
            
            /*PLAYER MOVE HORIZONTAL*/
            if (/*this.cursors.left.isDown ||*/ this.a_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityX(-100);
                animToPlay = 'left';
                this.player.setOffset(65, 55);
            } else if (/*this.cursors.right.isDown ||*/ this.d_key.isDown) {
                isMoving = true;
                this.container.body.setVelocityX(100);
                animToPlay = 'right';
                this.player.setOffset(25, 55);
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

            // check if left mouse button i clicked
            if (this.input.activePointer.isDown) {
                // console.log('this.input', this.input.activePointer.x, this.input.activePointer.worldX, this.input.activePointer.downX, this.container.x)
                if (this.container.x > this.input.activePointer.worldX) {
                    animToPlay = 'attack-left';
                } else {
                    animToPlay = 'attack-right';
                }
                isAttacking = true;
            }

            if (!isMoving && !isAttacking) {
                this.player.anims.stop();
                if (prevVelocity.x < 0 || currentAnimKey === 'attack-left' || currentAnimKey === 'idle-left') {
                    animToPlay = 'idle-left';
                    this.player.setOffset(65, 55);
                }
                else {
                    animToPlay = 'idle-right';
                    this.player.setOffset(25, 55);
                }
            }
            if (animToPlay) {
                this.player.anims.play(animToPlay, true);
            }
            // Normalize and scale the velocity so that player can't move faster along a diagonal
            this.container.body.velocity.normalize().scale(speed);
        }
    }
}

export default MainScene;