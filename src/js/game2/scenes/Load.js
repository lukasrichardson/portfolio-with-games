// import Phaser from 'phaser';
import gameConstants from '../../constants/game2.constants';

const { SCENES, dudeHeight, dudeWidth } = gameConstants;

class LoadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENES.LOAD
        });
    }

    preload() {
        this.loadingBar = this.add.graphics({
            fillStyle: {
                color: 0xffffff
            }
        });

        this.load.on('progress', percent => {
            this.loadingBar.fillRect(0, this.game.renderer.height / 2, this.game.renderer.width * percent, 50);
        });

        this.load.on('complete', () => {
            this.scene.start(SCENES.MENU);
        });

        this.load.image("mario-tiles", "super-mario-tiles.png");
        this.load.image('tiles', 'tuxmon-sample-32px-extruded.png');
        // this.load.tilemapCSV('map', 'catastrophi_level3.csv');
        // this.load.tilemapTiledJSON("map", "tuxemon-town.json");
        this.load.tilemapTiledJSON("map", "firstMap.json");
        this.load.atlas('atlas', 'atlas.png', 'atlas.json');
        
        this.load.atlas('knight-walk', './game-heroes/sheets/knight-walk.png', './game-heroes/sheets/knight-walk.json');
        
        this.load.spritesheet('redEnemy', 'dude.png', {
            frameWidth: dudeWidth,
            frameHeight: dudeHeight
        });

    }

    create() {

    }

    update() {

    }
}

export default LoadScene;