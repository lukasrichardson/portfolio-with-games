import React, { Component } from 'react';
import startGame2 from '../../game2/startGame2';
import TextMenu from '../TextMenu';

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
            <>
                <div id='game2'/>
                <TextMenu />
            </>
        )
    }
}
export default Play2;