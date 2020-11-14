import React from 'react';
import gameConstants from '../../constants/game2.constants';

const { SCENES } = gameConstants;

class MenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENES.MENU
        });
    }

    preload() {
    }

    create() {
        this.scene.start(SCENES.GAME);
    }

    update() {

    }
}

export default MenuScene;