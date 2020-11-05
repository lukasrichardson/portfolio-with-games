import React, { Component } from 'react';
import { Carousel } from 'antd';

const carouselSlides = [
    {
        name: 1,
        content: 'Use the Arrow keys to run on platforms. Press Space to jump.'
    },
    {
        name: 2,
        content: 'Avoid enemies and bombs while collecting stars to earn points. Click to shoot and kill enemies and bombs. The further you aim the faster your bullet will go.'
    },
    {
        name: 3,
        content: 'If you get hit by an enemy or a bomb you will take damage. If your health reaches 0 you will die.'
    }
]

class Instructions extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dotPosition: 'left',
        };
    }

    render() {
        const { dotPosition } = this.state;
        return (
            <div className='instructions'>
            <div className='instructions__header'>
                <span>How To Play</span>
            </div>
                <Carousel dotPosition={dotPosition}>
                    {carouselSlides.map( (item, index) => (
                        <div key={index} className='carousel-slide'>
                            <h2 className='carousel-slide__header'>{item.name}</h2>
                            <span className='carousel-slide__content'>{item.content}</span>
                            <div className='carousel-slide__img'/>
                        </div>
                    ))}
                </Carousel>
            </div>
        )
    }
}

export default Instructions;