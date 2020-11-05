import React, { Component } from 'react';
import Instructions from '../Instructions';

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='home'>
                <Instructions />
            </div>
        )
    }
}
export default Home;