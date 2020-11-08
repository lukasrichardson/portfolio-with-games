import React, { Component } from 'react';
import startGame from '../../startGame';

class Play extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.game= null;
    }

    componentDidMount() {
        this.game = startGame();
        console.log('did mount', this.game)
    }

    componentWillUnmount = () => {
        this.game.shouldDestroy = true;
        // this.game ? this.game.destroy() : null;
        console.log('unmount', this,game);
    }

    render() {
        return (
            <div id='game' />
        )
    }
}
export default Play;