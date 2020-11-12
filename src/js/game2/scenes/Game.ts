
// import Phaser from 'phaser';
import gameConstants from '../../constants/game2.constants';
//@ts-ignore

const { SCENES } = gameConstants;

class MainScene extends Phaser.Scene {
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | any;
    w_key: Phaser.Input.Keyboard.Key | any;
    a_key: Phaser.Input.Keyboard.Key | any;
    s_key: Phaser.Input.Keyboard.Key | any;
    d_key: Phaser.Input.Keyboard.Key | any;
    player: Phaser.Physics.Arcade.Sprite | any;
    interact: object | any
    constructor() {
        super({
            key: SCENES.GAME
        });
        this.interact = {};
    }

    init(data: any) {
    }

    creates() {
        //
        //
        this.add.sprite(100, 100, 'knight-walk', 'walk3.png').setScale(0.5);
        //
        //
    }

    preload() {

    }

    create() {
        console.log('create game 2');

        /*ADD CONTROLS*/
        this.cursors = this.input.keyboard.createCursorKeys();
        this.w_key = this.input.keyboard.addKey('W');
        this.a_key = this.input.keyboard.addKey('A');
        this.s_key = this.input.keyboard.addKey('S');
        this.d_key = this.input.keyboard.addKey('D');
        this.e_key = this.input.keyboard.addKey('E');
        this.e_key.on('down', () => {
            console.log('interact', this.player, this.interact);
            const menuElement = document.querySelector('.text-menu');
            if (menuElement){
                if (this.interact.text) {
                    if (menuElement.style.display === 'none') {
                        menuElement.style.display = 'block';
                        menuElement.querySelector('span').innerText = this.interact.text;
                    } else {
                        if (menuElement.querySelector('span').innerText === this.interact.text) {
                            menuElement.style.display = 'none';
                        } else {
                            menuElement.querySelector('span').innerText = this.interact.text;
                        }
                    }
                } else if (menuElement.style.display === 'block') {
                    menuElement.style.display = 'none';
                }
            }
        });

        /* Create Level */

        /*Load level from json */
        const map = this.make.tilemap({ key: "map" });

        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        const belowLayer = map.createStaticLayer("Below Player", tileset, 0, 0);
        const worldLayer = map.createStaticLayer("World", tileset, 0, 0);
        const aboveLayer = map.createStaticLayer("Above Player", tileset, 0, 0);
        worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);
        //debug
        // const debugGraphics = this.add.graphics().setAlpha(0.75);
        // worldLayer.renderDebug(debugGraphics, {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // });

        //add player
        // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
        // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
        const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
        //
        //
        this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, 'knight-walk', 'walk3.png').setSize(30, 40);
        this.physics.add.collider(this.player, worldLayer, this.playerWorldCollisionHandler);
        this.anims.create({
            key: 'walk',
            frameRate: 10,
            frames: this.anims.generateFrameNames('knight-walk', {
                prefix: 'walk',
                suffix: '.png',
                start: 1,
                end: 6
            }),
            repeat: -1

        });
        this.player.play('walk');

        // this.physics.add.sprite(spawnPoint.x + 50, spawnPoint.y + 50, 'atlas', 'misa-front').setSize(30, 40);
        //
        
        // Phaser supports multiple cameras, but you can access the default camera like this:
        const camera = this.cameras.main;
        // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
        camera.startFollow(this.player);
        camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Create the player's walking animations from the texture atlas. These are stored in the global
        // animation manager so any sprite can access them.
        this.anims.create({
            key: "misa-left-walk",
            frames: this.anims.generateFrameNames("atlas", { prefix: "misa-left-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "misa-right-walk",
            frames: this.anims.generateFrameNames("atlas", { prefix: "misa-right-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "misa-front-walk",
            frames: this.anims.generateFrameNames("atlas", { prefix: "misa-front-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: "misa-back-walk",
            frames: this.anims.generateFrameNames("atlas", { prefix: "misa-back-walk.", start: 0, end: 3, zeroPad: 3 }),
            frameRate: 10,
            repeat: -1
        });

        // Debug graphics
    this.input.keyboard.once("keydown_K", event => {
        // Turn on physics debugging to show player's hitbox
        this.physics.world.createDebugGraphic();

        // Create worldLayer collision graphic above the player, but below the help text
        const graphics = this.add
        .graphics()
        .setAlpha(0.75)
        .setDepth(20);
        worldLayer.renderDebug(graphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });
    });
    }

    update(time: any, delta: any) {
        // Apply the controls to the camera each update tick of the game
        //@ts-ignore
        if (this.game.shouldDestroy === true) {
            this.game.destroy(false);
        }

        const speed = 175;
        const prevVelocity = this.player.body.velocity.clone();
        this.player.body.setVelocity(0);
        /*PLAYER MOVE HORIZONTAL*/
        if (/*this.cursors.left.isDown ||*/ this.a_key.isDown) {
            this.player.body.setVelocityX(-100);
        } else if (/*this.cursors.right.isDown ||*/ this.d_key.isDown) {
            this.player.body.setVelocityX(100);
        }

        /*PLAYER MOVE VERTICAL*/
        if (/*this.cursors.up.isDown ||*/ this.w_key.isDown) {
            this.player.body.setVelocityY(-100);
        } else if (/*this.cursors.down.isDown ||*/ this.s_key.isDown) {
            this.player.body.setVelocityY(100);
        }

        if (this.cursors.left.isDown) {
            this.player.anims.play("misa-left-walk", true);
        } else if (this.cursors.right.isDown) {
            this.player.anims.play("misa-right-walk", true);
        } else if (this.cursors.up.isDown) {
            this.player.anims.play("misa-back-walk", true);
        } else if (this.cursors.down.isDown) {
            this.player.anims.play("misa-front-walk", true);
        } else {
            this.player.anims.stop();

            // If we were moving, pick and idle frame to use
            if (prevVelocity.x < 0) this.player.setTexture("atlas", "misa-left");
            else if (prevVelocity.x > 0) this.player.setTexture("atlas", "misa-right");
            else if (prevVelocity.y < 0) this.player.setTexture("atlas", "misa-back");
            else if (prevVelocity.y > 0) this.player.setTexture("atlas", "misa-front");
        }
        if (this.e_key.isDown) {
            
        }
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        this.player.body.velocity.normalize().scale(speed);
    }

    playerWorldCollisionHandler = (player, world) => {
        if (world.properties.text) {
            if (!this.interact.text !== world.properties.text)
            this.interact = {
                text: world.properties.text
            };
        }
    }
}

export default MainScene;