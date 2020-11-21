import React, { Component } from 'react';
class HudUi extends Component{
    render(){
        return(
            <div className="hud-ui">
                <div className='hud-ui__healthbar'>
                    <div className='hud-ui__healthbar--inner'/>
                    <div className='hud-ui__healthbar-text'>
                        <span className='hud-ui__healthbar-text--current'>0</span>
                        <span> / </span>
                        <span className='hud-ui__healthbar-text--total'>0</span>
                    </div>
                </div>
            </div>
        )
    }
}

export default HudUi;