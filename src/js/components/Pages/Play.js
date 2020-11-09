import React, { Component } from 'react';
import startGame from '../../startGame';
import JoinModal from '../JoinModal';

class Play extends Component {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        this.game = startGame();
        console.log('did mount', this.game)
    }

    componentWillUnmount = () => {
        this.game.shouldDestroy = true;
    }

    render() {
        return (
            <>
                <div id='game'/>
                <JoinModal/>
            </>
        )
    }
}
export default Play;