import React, { Component } from 'react';
import { Carousel } from 'antd';

const carouselSlides = [
    {
        name: 1,
        content: 'Use the Arrow keys to run on platforms. Press the Up arrow to jump.'
    },
    {
        name: 2,
        content: 'Click to shoot and kill enemies. The further you aim the faster your bullet will go.'
    },
    {
        name: 3,
        content: 'If you get hit by an enemy you will take damage. If your health reaches 0 you will die.'
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
                            <div>Back</div>
                            <h2 className='carousel-slide__header'>{item.name}</h2>
                            <span className='carousel-slide__content'>{item.content}</span>
                            <div className='carousel-slide__images'>
                            <div className={`carousel-slide__img instructions${index+1}`}/>
                            {item.name === 2 && <div className={`carousel-slide__img instructions${index+1}A`}/>}
                            </div>
                            <div>Next</div>
                        </div>
                    ))}
                </Carousel>
            </div>
        )
    }
}

export default Instructions;