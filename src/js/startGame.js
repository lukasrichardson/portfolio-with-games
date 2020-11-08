/** @type {import("../../typings/phaser")} */
import Phaser from 'phaser';
import gameConstants from './constants/game.constants.js';
import Load from './scenes/Load';
import Game from './scenes/Game';
import Menu from './scenes/Menu';

const { width, height, gravity } = gameConstants;

var config = {
    type: Phaser.AUTO,
    parent: 'game',
    width,
    height,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: gravity },
            debug: false
        }
    },
    scene: [Load, Menu, Game]
};

const startGame = () => new Phaser.Game(config);
export default startGame;