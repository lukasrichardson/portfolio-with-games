import React, { Component } from 'react';
import eventsCenter from '../EventsCenter';
import cx from 'classnames';

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

const cooldowns = [
    {
        name: 'cooldown1',
        title: 'Jump Attack'
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
            },
            cooldowns: {
                cooldown1: null
            }
        }
    }
    componentDidMount = () => {
        eventsCenter.on('updateHudStats', ({ name, value, total }) => {
            this.setStatValue(name, value, total);
        });
        eventsCenter.on('updateHudCooldown', ({ name, value }) => {
            this.setCooldownValue(name, value);
        })
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
    setCooldownValue = (name, value) => {
        this.setState({
            cooldowns: {
                ...this.state.cooldowns,
                [name]: value
            }
        });
    }
    createCooldownNumber = ({ name, title }) => {
        let number = this.state.cooldowns[name];
        if (number !== 0) return number / 1000;
        return title;
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
                <div className='hud-ui__fixed'>
                    <div className='hud-ui__cooldowns'>
                        {cooldowns.map( item => (
                            <div className='hud-cooldown'>
                                <div className='hud-cooldown__square'>
                                    <div className={cx('hud-cooldown__overlay', {
                                        'hud-cooldown__overlay--active': this.state.cooldowns[item.name] === 0,
                                        'hud-cooldown__overlay--disabled': this.state.cooldowns[item.name] !== 0
                                    })}/>
                                    <span className='hud-cooldown__number'>{this.createCooldownNumber(item)}</span>
                                </div>
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
            </div>
        )
    }
}

export default HudUi;