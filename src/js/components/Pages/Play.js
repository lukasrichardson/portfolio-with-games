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

    componentWillUnmount = () => {
        this.game ? this.game.destroy() : null;
    }

    render() {
        return (
            <div id='game' />
        )
    }
}
export default Play;