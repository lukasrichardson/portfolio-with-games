/** @type {import("../../../typings/phaser")} */
// import Phaser from 'phaser';
import gameConstants from '../constants/game2.constants';
import Load from './scenes/Load';
import Game from './scenes/Game';
import Menu from './scenes/Menu';
import HUD from './scenes/HUD';

const { width, height, gravity } = gameConstants;

var config = {
    type: Phaser.AUTO,
    parent: 'game2',
    width,
    height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    },
    // pixelArt: true,
    scene: [Load, Menu, Game, HUD]
};

const startGame = () => new Phaser.Game(config);
export default startGame;