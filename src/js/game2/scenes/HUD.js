import gameConstants from '../../constants/game2.constants';
import eventsCenter from '../../EventsCenter';

const { SCENES } = gameConstants;

class HUDScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENES.HUD
        });
        this.totalHealth = 100;
        this.currentHealth = 100;
    }

    preload() {
    }

    create() {
        
        eventsCenter.on('damage', stats => {
            const { health, totalHealth } = stats;
                this.currentHealth = health;
                this.totalHealth = totalHealth;
                if (this.currentHealth < 0) this.currentHealth = 0;
                this.setBarValue();
        });
        this.setBarValue();
    }

    //create helper functions
    setBarValue = () => {
        const healthBar = document.getElementsByClassName('hud-ui__healthbar--inner') ? document.getElementsByClassName('hud-ui__healthbar--inner')[0] : null;
        const healthBarText = document.getElementsByClassName('hud-ui__healthbar-text') ? document.getElementsByClassName('hud-ui__healthbar-text')[0] : null;
        const scalePercentage = this.currentHealth / this.totalHealth * 100;
        if (healthBar) {
            healthBar.style.width = `${scalePercentage}%`;
            if (scalePercentage > 60) {
                healthBar.style.backgroundColor = 'green';
            } else {
                if (scalePercentage <= 60) {healthBar.style.backgroundColor = 'yellow';}
                if (scalePercentage <= 30) healthBar.style.backgroundColor = 'red';
            }
        }
        if (healthBarText) {
            const current = healthBarText.children[0];
            const total = healthBarText.children[2];
            const slash = healthBarText.children[1];
            current.innerText = this.currentHealth;
            total.innerText = this.totalHealth;
            if (scalePercentage > 30 && scalePercentage <= 60) {
                console.log('scale percent', scalePercentage);
                current.style.color = 'black';
                total.style.color = 'black';
                slash.style.color = 'black';
            } else {
                current.style.color = 'white';
                total.style.color = 'white';
                slash.style.color = 'white';
            }
        }
    }

    update() {

    }
}

export default HUDScene;
