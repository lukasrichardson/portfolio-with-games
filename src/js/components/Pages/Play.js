import React, { Component } from 'react';
import startGame from '../game';

class Play extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.game= null;
    }

    componentDidMount() {
        this.game = startGame();
    }

    render() {
        return (
            <div id='game' ref={r=> this.gameContainer = r} />
        )
    }
}
export default Play;