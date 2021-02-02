import React, { Component } from 'react';

class SolarSystem extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='solar-system-project unity-game'>
                <iframe src='solarSystem.html' className='unity-game__iframe'></iframe>
            </div>
        )
    }
}
export default SolarSystem;