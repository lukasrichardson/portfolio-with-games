import React, { Component } from 'react';

class BoxShooter extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='box-shooter-project unity-game'>
                <iframe src='boxShooter.html' className='unity-game__iframe'></iframe>
            </div>
        )
    }
}
export default BoxShooter;