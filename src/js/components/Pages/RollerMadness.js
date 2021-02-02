import React, { Component } from 'react';

class rollerMadness extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='roller-madness-project unity-game'>
                <iframe src='rollerMadness.html' className='unity-game__iframe'></iframe>
            </div>
        )
    }
}
export default rollerMadness;