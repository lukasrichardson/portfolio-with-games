import gameConstants from '../../constants/game2.constants';
import eventsCenter from '../../EventsCenter';
const { defaultPlayerStats } = gameConstants;

const updateHudStats = (name: any, value: any, total: any, _this: any) => {
    eventsCenter.emit('updateHudStats', {
        name,
        value,
        total
    });
    if (name === 'health')
    eventsCenter.emit('updateHealthBar', _this.playerStats);
}

export const updateHudCooldown = (name: any, value: any) => {
    eventsCenter.emit('updateHudCooldown', {
        name,
        value
    });
}

const collideWithEnemy = (_this: any) => (container: any, enemy: any) => {
    const { name } = enemy.healthBar;
    if (!_this.hitBy[name]) {
        _this.hitBy[name] = name;
        _this.playerStats.health.current -= 10;
       updateHudStats('health', _this.playerStats.health.current, _this.playerStats.health.max, _this);
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
        if (!_this.redEnemy.active && !_this.blueEnemy.active) {
            spawnEnemies(_this);
        }
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
const calcAttackSpeedPercent = (value: any) => {
    console.log(defaultPlayerStats.attackSpeed.current, value)
    return Math.round((defaultPlayerStats.attackSpeed.current + (defaultPlayerStats.attackSpeed.current - value)) / defaultPlayerStats.attackSpeed.current * 100);
}

export const addControls = (_this: any) => {
    /*ADD CONTROLS*/
    _this.input.mouse.capture = true;
    _this.cursors = _this.input.keyboard.createCursorKeys();
    _this.w_key = _this.input.keyboard.addKey('W');
    _this.a_key = _this.input.keyboard.addKey('A');
    _this.s_key = _this.input.keyboard.addKey('S');
    _this.d_key = _this.input.keyboard.addKey('D');
    _this.w_key.on('down', () => {
        _this.lastDirection = 'up';
    });
    _this.a_key.on('down', () => {
        _this.lastDirection = 'left';
    });
    _this.s_key.on('down', () => {
        _this.lastDirection = 'down';
    });
    _this.d_key.on('down', () => {
        _this.lastDirection = 'right';
    });
    
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
    //create player animations viking
    // _this.anims.create({
    //     key: 'right',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'walk',
    //         suffix: '.png',
    //         start: 1,
    //         end: 6
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'left',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'left-walk',
    //         suffix: '.png',
    //         start: 1,
    //         end: 6
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'attack-right',
    //     frameRate: 16,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'auto_attack',
    //         suffix: '.png',
    //         start: 0,
    //         end: 4
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'attack-left',
    //     frameRate: 16,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'auto_left-attack',
    //         suffix: '.png',
    //         start: 0,
    //         end: 4
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'idle-left',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'left-walk',
    //         suffix: '.png',
    //         start: 1,
    //         end: 1
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'idle-right',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'walk',
    //         suffix: '.png',
    //         start: 1,
    //         end: 1
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'attack-extra-left',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'left-attack_extra',
    //         suffix: '.png',
    //         start: 1,
    //         end: 8
    //     }),
    //     repeat: -1

    // });
    // _this.anims.create({
    //     key: 'attack-extra-right',
    //     frameRate: 10,
    //     frames: _this.anims.generateFrameNames('knight-walk', {
    //         prefix: 'attack_extra',
    //         suffix: '.png',
    //         start: 1,
    //         end: 8
    //     }),
    //     repeat: -1

    // });
     // archer
     _this.anims.create({
        key: 'walk-down',
        frameRate: 14,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'archer-',
            suffix: '.png',
            start: 78,
            end: 86
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'walk-up',
        frameRate: 14,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'archer-',
            suffix: '.png',
            start: 60,
            end: 68
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'walk-left',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'archer-',
            suffix: '.png',
            start: 69,
            end: 76
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'walk-right',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'archer-',
            suffix: '.png',
            start: 87,
            end: 94
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'auto-attack-up',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'auto-attack-up-',
            suffix: '.png',
            start: 1,
            end: 13
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'auto-attack-down',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'auto-attack-down-',
            suffix: '.png',
            start: 1,
            end: 13
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'auto-attack-left',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'auto-attack-left-',
            suffix: '.png',
            start: 1,
            end: 13
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'auto-attack-right',
        frameRate: 12,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'auto-attack-right-',
            suffix: '.png',
            start: 1,
            end: 13
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'idle-left',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'auto-attack-left-',
            suffix: '.png',
            start: 1,
            end: 1
        }),
        repeat: -1
    });
    _this.anims.create({
        key: 'idle-right',
        frameRate: 10,
        frames: _this.anims.generateFrameNames('archer', {
            prefix: 'archer-',
            suffix: '.png',
            start: 87,
            end: 87
        }),
        repeat: -1
    });
}

export const addPlayer = (_this: any) => {
    //create container for player sprites / hitboxes
    _this.container = _this.add.container(_this.spawnPoint.x, _this.spawnPoint.y);
    _this.container.setSize(36, 39);
    _this.physics.world.enable(_this.container);
    // add damage player has taken to scene instance data
    _this.hitBy = {};
    // put player sprite inside a container that will control collisions and movement
    // _this.player = _this.physics.add.sprite(0, 0, 'archer', 'archer-78.png').setScale(1, 1).setSize(36, 49).setOffset(65, 60);
    _this.player = _this.physics.add.sprite(0, -10, 'archer', 'archer-78.png').setScale(1, 1).setSize(36, 49);
    _this.playerStats = { ...defaultPlayerStats };
    console.log('current health', _this.playerStats['health'].current);
    if (_this.playerStats.health.current === 0) _this.playerStats.health.current=  _this.playerStats.health.max;
    Object.keys(_this.playerStats).forEach(key => {
        if (key === 'cooldown1') updateHudCooldown(key, _this.playerStats[key].current);
        if (key === 'attackSpeed')  updateHudStats(key, 100, _this.playerStats[key].min, _this);
        else updateHudStats(key, _this.playerStats[key].current, _this.playerStats[key].max, _this);
    });

    _this.hitBox = _this.physics.add.sprite(0, 5, 'hitbox').setScale(1, 1).setSize(0, 0).setVisible(false);
    _this.container.add([_this.player, _this.hitBox]);

    // container collides with world layer
    _this.physics.add.collider(_this.container, _this.worldLayer, playerWorldCollisionHandler(_this));
    
    // // start with idle animation
    _this.player.anims.play('idle-left');

    // Phaser supports multiple cameras, but you can access the default camera like _this:
    const camera = _this.cameras.main;
    // Constrain the camera so that it isn't allowed to move outside the width/height of tilemap
    camera.startFollow(_this.container);
    camera.setBounds(0, 0, _this.map.widthInPixels, _this.map.heightInPixels);
    camera.zoom = .8;

    if (_this.spawns) {
        addEnemyInteractions(_this);
    }
    eventsCenter.emit('updateHealthBar', _this.playerStats);
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
        let total = null;
        switch (name) {
            case 'health':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            health: {
                                ..._this.playerStats.health,
                                current: _this.playerStats.health.current + 10,
                                max: _this.playerStats.health.max + 10
                            }
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            health: {
                                ..._this.playerStats.health,
                                current: _this.playerStats.health.current - 10,
                                max: _this.playerStats.health.max - 10
                            }
                        }
                        break;
                    default:
                        break;
                }
                if (_this.playerStats.health.current > _this.playerStats.health.max) _this.playerStats.health.current = _this.playerStats.health.max;
                if (_this.playerStats.health.current < _this.playerStats.health.min) _this.playerStats.health.current = _this.playerStats.health.min;
                value = _this.playerStats.health.current;
                total = _this.playerStats.health.max;
                eventsCenter.emit('updateHealthBar', _this.playerStats);
                break;
            case 'speed':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            speed: {
                                ..._this.playerStats.speed,
                                current: _this.playerStats.speed.current + 10
                            }
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            speed: {
                                ..._this.playerStats.speed,
                                current:  _this.playerStats.speed.current - 10
                            }
                        }
                        break;
                    default:
                        break;
                }
                if (_this.playerStats.speed.current > _this.playerStats.speed.max) _this.playerStats.speed.current = _this.playerStats.speed.max;
                if (_this.playerStats.speed.current < _this.playerStats.speed.min) _this.playerStats.speed.current = _this.playerStats.speed.min;
                value = _this.playerStats.speed.current;
                total = _this.playerStats.speed.max;
                break;
            case 'attackSpeed':
                switch (operation) {
                    case 'add':
                        _this.playerStats = {
                            ..._this.playerStats,
                            attackSpeed: {
                                ..._this.playerStats.attackSpeed,
                                current: _this.playerStats.attackSpeed.current - 50
                            }
                        }
                        break;
                    case 'subtract':
                        _this.playerStats = {
                            ..._this.playerStats,
                            attackSpeed: {
                                ..._this.playerStats.attackSpeed,
                                current: _this.playerStats.attackSpeed.current + 50
                            }
                        }
                        break;
                    default:
                        break;
                }
                if (_this.playerStats.attackSpeed.current > _this.playerStats.attackSpeed.min) _this.playerStats.attackSpeed.current = _this.playerStats.attackSpeed.min;
                if (_this.playerStats.attackSpeed.current < _this.playerStats.attackSpeed.max) _this.playerStats.attackSpeed.current = _this.playerStats.attackSpeed.max;
                value = calcAttackSpeedPercent(_this.playerStats.attackSpeed.current);
                total = calcAttackSpeedPercent(_this.playerStats.attackSpeed.max);
                break;
            default:
                break;
        }
        updateHudStats(name, value, total, _this);
    });
}
