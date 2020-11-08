import Phaser from 'phaser';
import gameConstants from '../constants/game.constants';

const { SCENES, width, height } = gameConstants;

class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENES.MENU
        });
    }

    preload() {
    }

    create() {
        /*ADD SKY*/
        this.add.image(0, 0, 'sky').setOrigin(0, 0);

        /*ADD PLATFORMS*/
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

        /*ADD PLAY BUTTON*/
        this.scoreText = this.add.text(300, 300, 'PLAY', {
            fontSize: '42px',
            fill: '#000'
        });
        this.scoreText.setInteractive();
        this.scoreText.on('pointerup', e => {
            this.scene.start(SCENES.GAME);
        })
    }

    update() {

    }
}

export default MenuScene;