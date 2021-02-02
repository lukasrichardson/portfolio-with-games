import gameConstants from '../../constants/game.constants';

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

        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.image('bomb', 'bomb.png');
        this.load.image("bullet", "bullet.png");
        this.load.spritesheet('dude', 'dude.png', {
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