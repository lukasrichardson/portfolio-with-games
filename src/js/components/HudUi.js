import React, { Component } from 'react';
import eventsCenter from '../EventsCenter';

const stats = [
    {
        title: 'Health',
        name: 'health'
    },
    {
        title: 'Speed',
        name: 'speed'
    },
    {
        title: 'Attack Speed',
        name: 'attackSpeed'
    }
]

class HudUi extends Component {
    constructor(props) {
        super(props);
        this.state = {
            stats: {
                health: {
                    current: null,
                    total: null
                },
                speed: {
                    current: null,
                    total: null
                },
                attackSpeed: {
                    current: null,
                    total: null
                }
            }
        }
    }
    componentDidMount = () => {
        eventsCenter.on('updateHudStats', ({ name, value, total }) => {
            console.log('updateHudStats', name, value, total);
            this.setStatValue(name, value, total);
        });
    }
    setStatValue = (name, value, total) => {
        this.setState({
            stats: {
                ...this.state.stats,
                [name]: {
                    current: value,
                    total: total
                }
            }
        });
    }

    render() {
        return (
            <div className="hud-ui">
                <div className='hud-ui__stats' style={{ display: 'none' }}>
                    <div className='hud-ui__stats-header'>
                        <span className='stats-title__name'>Name</span>
                        <span className='stats-title'>Subtract</span>
                        <span className='stats-title'>Add</span>
                        <span className='stats-title'>Value</span>
                    </div>
                    {stats.map(item => (
                        <div className='hud-ui__stats-item' key={item.name}>
                            <span className='hud-ui__stats-name'>{item.title}</span>
                            <span
                                className='hud-ui__stats-subtract'
                                onClick={() => eventsCenter.emit('changeStats', {
                                    name: item.name,
                                    operation: 'subtract'
                                }
                                )}>-</span>
                            <span
                                className='hud-ui__stats-add'
                                onClick={() => eventsCenter.emit('changeStats', {
                                    name: item.name,
                                    operation: 'add'
                                }
                                )}>+</span>
                            <span className='hud-ui__stats-value'>
                                {this.state.stats[item.name].current}
                            </span>
                            <span className='hud-ui__stats-total'>
                                / {this.state.stats[item.name].total}
                            </span>
                        </div>
                    ))}
                </div>
                <div className='hud-ui__healthbar'>
                    <div className='hud-ui__healthbar--inner' />
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