import React, { Component } from 'react';
import startGame2 from '../../game2/startGame2';
import TextMenu from '../TextMenu';
import HudUi from '../HudUi';

class Play2 extends Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        this.game = startGame2();
        console.log('did mount', this.game)
    }

    componentWillUnmount = () => {
        this.game.shouldDestroy = true;
    }

    render() {
        return (
            <div className='game2Container'>
                <div id='game2'/>
                <TextMenu />
                <HudUi />
                <ul className='temp-instructions'>
                    <li>use "WASD" to walk</li>
                    <li>use "LeftMouse" to attack</li>
                    <li>use "SHIFT" to do a big Attack</li>
                    <li>use "I" to open and close the edit stats menu</li>
                    <li>hitting an enemy with an attack to lower enemy healthbars</li>
                    <li>getting hit by an enemy will cause you to lose health</li>
                    <li>You will respawn when you are at 0 health</li>
                </ul>
            </div>
        )
    }
}
export default Play2;