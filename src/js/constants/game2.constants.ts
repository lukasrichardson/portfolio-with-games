export default {
    width: 800,
    height: 600,
    gravity: 300,
    dudeWidth: 32,
    dudeHeight: 48,
    SCENES: {
        GAME: 'GAME',
        LOAD: 'LOAD',
        MENU: 'MENU',
        HUD: 'HUD'
    },
    ANIMATIONS: {

    },
    defaultSpeed: 175,
    defaultPlayerStats : {
        health: {
            current: 100,
            min: 0,
            max: 100
        },
        speed: {
            current: 175,
            min: 50,
            max: 1000
        },                
        attackSpeed: {
            current: 500,
            min: 1000,
            max: 50
        },
        cooldown1: {
            current: 0,
            min: 0,
            max: 5000
        }
    },
    archer: {
        width: 51,
        height: 52
    }
}