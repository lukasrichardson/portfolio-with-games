import gameConstants from '../../constants/game2.constants';
import eventsCenter from '../../EventsCenter';
const { defaultPlayerStats } = gameConstants;

export const addControls = (_this: any) => {
    /*ADD CONTROLS*/
    _this.input.mouse.capture = true;
    _this.cursors = _this.input.keyboard.createCursorKeys();
    _this.w_key = _this.input.keyboard.addKey('W');
    _this.a_key = _this.input.keyboard.addKey('A');
    _this.s_key = _this.input.keyboard.addKey('S');
    _this.d_key = _this.input.keyboard.addKey('D');
    _this.e_key = _this.input.keyboard.addKey('E');
    _this.i_key = _this.input.keyboard.addKey('I');
    _this.i_key.on('down', () => {
        // interact menu logic
        const statsMenu = document.querySelector('.hud-ui__stats');
        if (statsMenu) {
            //@ts-ignore
            if (statsMenu.style.display === 'none') {
                //@ts-ignore
                statsMenu.style.display = 'flex';
                _this.displayStatsMenu = true;
            } else {
                //@ts-ignore
                statsMenu.style.display = 'none';
                _this.displayStatsMenu = false;
            }
        }
    });
    _this.shift = _this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
}

export const createMapLayers = (_this: any) => {
    /*Load level from json */
    _this.map = _this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = _this.map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    const belowLayer = _this.map.createDynamicLayer("Below Player", tileset, 0, 0);
    _this.worldLayer = _this.map.createDynamicLayer("World", tileset, 0, 0);
    const aboveLayer = _this.map.createDynamicLayer("Above Player", tileset, 0, 0);
    _this.worldLayer.setCollisionByProperty({ collides: true });
    aboveLayer.setDepth(10);
    //belowLayer.putTileAt(10, 20, 10);// put tile at index 10 from tilemap at layer grid location (20, 20)
    // belowLayer.putTileAtWorldXY(2, 200, 50);// put til at index 2 from tilemap at layer pixel location (200, 50)


    // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
    // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
    _this.spawnPoint = _this.map.findObject("Objects", (obj: any) => obj.name === "Spawn Point");
    _this.redSpawn = _this.map.findObject("Objects", (obj: any) => obj.name === "Red Spawn");
    _this.blueSpawn = _this.map.findObject("Objects", (obj: any) => obj.name === "Blue Spawn");
}

export const addPlayerAnims = (_this: any) => {
    //create player animations
    _this.anims.create({
        key: 'right',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'walk',
            suffix: '.png',
            start: 1,
            end: 6
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'left',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'left-walk',
            suffix: '.png',
            start: 1,
            end: 6
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'attack-right',
        frameRate: 16,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'auto_attack',
            suffix: '.png',
            start: 0,
            end: 4
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'attack-left',
        frameRate: 16,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'auto_left-attack',
            suffix: '.png',
            start: 0,
            end: 4
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'idle-left',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'left-walk',
            suffix: '.png',
            start: 1,
            end: 1
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'idle-right',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'walk',
            suffix: '.png',
            start: 1,
            end: 1
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'attack-extra-left',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'left-attack_extra',
            suffix: '.png',
            start: 1,
            end: 8
        }),
        repeat: -1

    });
    _this.anims.create({
        key: 'attack-extra-right',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('knight-walk', {
            prefix: 'attack_extra',
            suffix: '.png',
            start: 1,
            end: 8
        }),
        repeat: -1

    });
}

const collideWithEnemy = (_this: any) => (container: any, enemy: any) => {
    const { name } = enemy.healthBar;
    if (!_this.hitBy[name]) {
        _this.hitBy[name] = name;
        _this.playerStats.health -= 10;
        eventsCenter.emit('damage', _this.playerStats);
        _this.player.setTint(0xFF0000);
        _this.time.delayedCall(500, () => {
            delete _this.hitBy[name];
            _this.player.clearTint();
        }, undefined, _this);
    } else {
    }
}
const hitEnemy = (_this: any) => (hitBox: any, enemy: any) => {
    const { parentContainer } = hitBox;
    const { currentFrame } = parentContainer.list[0].anims;
    const { name: frameName } = currentFrame.frame;
    const { name } = enemy.healthBar;
    //@ts-ignore
    let enemyHealthBar = _this[name];
    
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
        _this.time.delayedCall(200, () => {
            enemy.healthBar = {
                ...enemy.healthBar,
                immune: false
            };
            enemy.clearTint();
        }, undefined, _this);
    }
    if (enemy.healthBar.current <= 0) {
        enemy.destroy();
    }
}
const addEnemyInteractions = (_this: any) => {
    // add attack logic for player hitting enemy
    _this.physics.add.overlap(_this.spawns, _this.hitBox, hitEnemy(_this));

    // collision logic with enemy and player container
    _this.physics.add.collider(_this.spawns, _this.container, collideWithEnemy(_this));
}
const playerWorldCollisionHandler = (_this: any) => (player: any, world: any) => {
    if (world.properties.text) {
        if (!_this.interact.text !== world.properties.text)
        _this.interact = {
            text: world.properties.text
        };
    }
}
const moveEnemies = (_this: any) => {
    _this.spawns.getChildren().forEach((enemy: any) => {
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
        _this.spawns.setVelocityX(0);
        _this.spawns.setVelocityY(0);
        }, 500);
}

export const addPlayer = (_this: any) => {
    //create container for player sprites / hitboxes
    _this.container = _this.add.container(_this.spawnPoint.x, _this.spawnPoint.y);
    _this.container.setSize(36, 49).setScale(0.8, 0.8);
    _this.physics.world.enable(_this.container);
    // add damage player has taken to scene instance data
    _this.hitBy = {};
    // put player sprite inside a container that will control collisions and movement
    _this.player = _this.physics.add.sprite(0, 5, 'knight-walk', 'walk1.png').setScale(1, 1).setSize(36, 49).setOffset(65, 60);
    _this.playerStats = {
        health: 100,
        totalHealth: 100,
        speed: defaultPlayerStats.speed,
        attackSpeed: defaultPlayerStats.attackSpeed
    }
    Object.keys(_this.playerStats).forEach(key => {
        if (key === 'attackSpeed')  eventsCenter.emit('updateHudStats', { name: key, value: (defaultPlayerStats[key] + (defaultPlayerStats[key] - _this.playerStats[key])) / defaultPlayerStats[key] * 100 });
        else eventsCenter.emit('updateHudStats', { name: key, value: _this.playerStats[key] });
    });

    _this.hitBox = _this.physics.add.sprite(0, 5, 'hitbox').setScale(1, 1).setSize(0, 0).setVisible(false);
    _this.container.add([_this.player, _this.hitBox]);

    // container collides with world layer
    _this.physics.add.collider(_this.container, _this.worldLayer, playerWorldCollisionHandler(_this));
    
    // start with idle animation
    _this.player.anims.play('idle-left');
    // Phaser supports multiple cameras, but you can access the default camera like _this:
    const camera = _this.cameras.main;
    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.startFollow(_this.container);
    camera.setBounds(0, 0, _this.map.widthInPixels, _this.map.heightInPixels);

    if (_this.spawns) {
        addEnemyInteractions(_this);
    }
    eventsCenter.emit('damage', _this.playerStats);
}

export const spawnEnemies = (_this: any) => {
    // create enemies group
    _this.spawns = _this.physics.add.group({
        classType: Phaser.GameObjects.Sprite,
        immovable: true
    });
    // create enemies
    _this.redEnemy = _this.spawns.create(_this.redSpawn.x, _this.redSpawn.y, 'redEnemy');
    _this.redEnemy.healthBar = {
        current: 100,
        total: 100,
        immune: false,
        name: 'redEnemyBar'
    };
    _this.redEnemyBar = _this.add.graphics();
    _this.redEnemyBar.fillStyle(0x2ecc71, 1);
    _this.redEnemyBar.fillRect(0, 0, 20, 5);
    _this.redEnemyBar.x = _this.redSpawn.x;
    _this.redEnemyBar.y = _this.redSpawn.y;
    _this.redEnemyBar.setDepth(50);

    // _this.redEnemyContainer = _this.add.container(_this.redSpawn.x, _this.redSpawn.y);
    // _this.redEnemyContainer.setSize(36, 49);
    // _this.redEnemyContainer.add(_this.redEnemyBar);

    _this.blueEnemy = _this.spawns.create(_this.blueSpawn.x, _this.blueSpawn.y, 'redEnemy');
    _this.blueEnemy.healthBar = {
        current: 100,
        total: 100,
        immune: false,
        name: 'blueEnemyBar'
    };
    _this.blueEnemyBar = _this.add.graphics();
    _this.blueEnemyBar.fillStyle(0x2ecc71, 1);
    _this.blueEnemyBar.fillRect(0, 0, 20, 5);
    _this.blueEnemyBar.x = _this.redSpawn.x;
    _this.blueEnemyBar.y = _this.redSpawn.y;
    _this.blueEnemyBar.setDepth(50);

    // add collider for map and enemies
    _this.physics.add.collider(_this.spawns, _this.worldLayer/*, _this.spawnsWorldCollisionHandler*/);

    addEnemyInteractions(_this);

    _this.timedEvent = _this.time.addEvent({
        delay: 600,
        callback: () => moveEnemies(_this),
        callbackScope: _this,
        loop: true
    })
}

export const addChangeStatsListener = (_this: any) => {
    eventsCenter.on('changeStats', (stats: any) => {
        const { name, operation } = stats;
        let value = null;
        switch (name) {
            case 'health':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            health: _this.playerStats.health + 10,
                            totalHealth: _this.playerStats.totalHealth + 10
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            health: _this.playerStats.health - 10,
                            totalHealth: _this.playerStats.totalHealth - 10
                        }
                        break;
                    default:
                        break;
                }
                value = _this.playerStats.totalHealth;
                eventsCenter.emit('damage', _this.playerStats);
                break;
            case 'speed':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            speed: _this.playerStats.speed + 10
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            speed: _this.playerStats.speed - 10
                        }
                        break;
                    default:
                        break;
                }
                value = _this.playerStats.speed;
                break;
            case 'attackSpeed':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            attackSpeed: _this.playerStats.attackSpeed - 50
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            attackSpeed: _this.playerStats.attackSpeed + 50
                        }
                        break;
                    default:
                        break;
                }
                if (_this.playerStats.attackSpeed < 50) _this.playerStats.attackSpeed = 50;
                if (_this.playerStats.attackSpeed > 750) _this.playerStats.attackSpeed = 750;
                value = (defaultPlayerStats.attackSpeed + (defaultPlayerStats.attackSpeed - _this.playerStats.attackSpeed)) / defaultPlayerStats.attackSpeed * 100;
                break;
            default:
                break;
        }
        eventsCenter.emit('updateHudStats', { name, value });
    });
}