import React from 'react';
import Phaser from 'phaser';
import gameConstants from '../constants/game.constants';

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
        /*ADD SKY*/
        this.add.image(0, 0, 'sky').setOrigin(0, 0);

        /*ADD PLATFORMS*/
        this.platforms = this.physics.add.staticGroup();
        this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();
        this.platforms.create(600, 400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');

        /*ADD PLAY BUTTON*/
        // this.scoreText = this.add.text(300, 300, 'PLAY', {
        //     fontSize: '42px',
        //     fill: '#000'
        // });
        // this.scoreText.setInteractive();
        // this.scoreText.on('pointerup', e => {
        //     this.scene.start(SCENES.GAME);
        // });

        //
        this.socket = io();
        this.socket.on('sendRooms', rooms => {
            this.rooms = rooms;
            if (this.roomsDropdown) {
                this.roomsDropdown.options[0] = new Option('Please Select A Room Number');
                for (let number of Object.keys(this.rooms)) {
                    if (number) {
                        this.roomsDropdown.options[this.roomsDropdown.length] = new Option(number);
                    }
                }
            }
        });
        this.socket.on('allowJoin', ({ username, roomNumber }) => {
            this.scene.start(SCENES.GAME, { username, roomNumber});
        });
        this.socket.on('denyJoin', ({ username, roomNumber }) => {
            //todo
        });

        const scaleBox = scale => {
            let box = document.getElementById('input-box');
            if (box) {
                box.style.transform = `scale(${scale})`;
                box.style.transformOrigin = 'top left';
                box.style.top = `${this.game.canvas.offsetTop + this.scale.displaySize.height / 2 - (250 / 2) * scale}px`;
                box.style.left = `${this.game.canvas.offsetLeft + this.scale.displaySize.width / 2 - (300 / 2) * scale}px`;
            }
        };

        // initial scale
        let scale = this.game.scale.displaySize.width / this.game.scale.gameSize.width;
        scaleBox(scale);

        // on resize listener
        this.scale.on('resize', (gameSize, baseSize, displaySize, resolution) => {
            let scale = displaySize.width / gameSize.width;
            scaleBox(scale);
        });

        // stores all created phaser texts
        let createdTexts = {}
        
        // creates a new phaser text
        const createText = (name, i) => {
            let text = createdTexts[name] || this.add.text(10, 100 + 20 * i, '')
            createdTexts[name] = text
            return text
        }

        // add clickMe test
        this.add
            .text(this.cameras.main.width / 2, this.cameras.main.height / 2, 'PLAY', { fontSize: 52 })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
            let element = document.getElementById('input-box')
            if (element && element.style.display === 'none') {
                this.socket.emit('getRooms');
                element.style.display = 'block'
                for (let i = 0; i < element.children.length; i++) {
                    let child = element.children[i];
                    // it is an input element
                    if (child.tagName === 'INPUT') {
                        child.addEventListener('input', () => {
                            if (child.name === 'roomNumber') {
                                this.roomsDropdown.selectedIndex = 0;
                            };
                        });
                        if (child.name === 'roomNumber') {
                            this.roomNumberInput = child;
                        } else if (child.name === 'username') {
                            this.usernameInput = child;
                        }
                    } else if (child.tagName === 'SELECT') {
                        child.options.length = 0;
                        child.addEventListener('change', e => {
                            if (Number(e.target.value)) {
                                this.roomNumberInput.value = '';
                            }
                        })
                        this.roomsDropdown = child;
                    }

                    // it is the button
                    else if (child.tagName === 'BUTTON') {
                        child.addEventListener('click', () => {
                        element.style.display = 'none';

                        let usernameTyped;
                        if (this.usernameInput) {
                            usernameTyped = this.usernameInput.value;
                        }
                        let roomNumberTyped;
                        if (this.roomNumberInput) {
                            roomNumberTyped = this.roomNumberInput.value;
                        }
                        let roomNumberDropdown;
                        if (this.roomsDropdown) {
                            roomNumberDropdown = this.roomsDropdown.value;
                        }
                        this.socket.emit('askToJoin', {
                            username: usernameTyped,
                            roomNumber: roomNumberTyped || roomNumberDropdown
                        });
                        })
                    }
                }
            }
        });
    }

    update() {

    }

    renderOptions = () => {
        return (
            <option></option>
        )
    }
}

export default MenuScene;